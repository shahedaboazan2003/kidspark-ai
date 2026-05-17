import { AuthUser } from "@supabase/supabase-js";

const CLIENT_ID_KEY = "chat_client_id";

export const getClientId = (): string => {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = `cl_${crypto.randomUUID()}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
};

export type DbMessage = {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type AskMessage = {
  id:number
  question:string
  answer:string
  imageDescription?:string
  voiceText?:string
  createdAt:string
  audioUrl?: string;
  imageUrl?: string;
}

export type Conversation = {
  id: number;
  title: string;
  lastActivity: string;
};

export const listConversations = async (childId : number) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/conversation/${childId}`,
    {
      headers: {
        Authorization: localStorage.getItem('accessToken')
          ? `Bearer ${localStorage.getItem('accessToken')}`
          : ''
      }
    }
  );
  const data = await res.json()
  return data.data.data;
};

export const createConversation = async (question:string) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/conversation`, {
    method: "POST",
    headers: { "Content-Type": "application/json",
       Authorization: localStorage.getItem('accessToken')  
       ? `Bearer ${localStorage.getItem('accessToken')}`
        : '' },
    body: JSON.stringify( {question} ),
  });
  const data = await res.json();
  return data.data.data;
};

// export const renameConversation = async (id: number, title: string) => {
//   await fetch(`${import.meta.env.VITE_API_URL}/conversation/${id}`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ title }),
//   });
// };

export const deleteConversation = async (id: number) => {
  const r = await fetch(`${import.meta.env.VITE_API_URL}/conversation/${id}`, {
    method: "DELETE",
    headers:{
      Authorization: localStorage.getItem('accessToken')  
      ? `Bearer ${localStorage.getItem('accessToken')}`
        : ''
    }
  });
   if (!r.ok) {
    throw new Error(`Delete failed: ${r.status}`);
  }
  console.log("delteeeee", r)
  return r.json();
};

export const listMessages = async (conversationId: number) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/ask/${conversationId}/messages`,
    {
      headers: {
        Authorization: localStorage.getItem('accessToken')
          ? `Bearer ${localStorage.getItem('accessToken')}`
          : ''
      }
    }
  );
  const data = await res.json();
  return data.data.data
};

// export const insertMessage = async (
//   formData:FormData
// ) => {
//   for (const pair of formData.entries()) {
//   console.log(pair[0], pair[1]);
// }
//   const res = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
//     method: "POST",
//     headers: { 
//       Authorization: localStorage.getItem("accessToken")
//         ? `Bearer ${localStorage.getItem("accessToken")}`
//         : "", },
//     body: formData,
//   });
//   console.log("الاستجابة",res)
//   return res.json();
// };

// export const updateMessageContent = async (id: string, content: string) => {
//   await fetch(`${import.meta.env.VITE_API_URL}/messages/${id}`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ content }),
//   });
// };

/** Stream chat response token-by-token from the edge function. */


export async function streamChat({
  question,
  childId,
  conversationId,
  age,
  files,
  onDelta,
  onDone,
  onError,
  onAudio,
  onImage,
  readingLevel,
  responseLength,
  learningStyle,
  interests

}: {
  question: string;
  childId: number;
  conversationId?: number;
  age: number;
  readingLevel?: string;
  responseLength?: string;
  learningStyle?: string;
  interests?: string[];
  files?: File[];
  onDelta: (chunk: string) => void;
  onDone: (data?: {
  audioUrl?: string;
  imageUrl?: string;
}) => void;
  onAudio?: (audioUrl: string) => void;
  onImage?: (imageUrl: string) => void;
  onError: (msg: string) => void;
}) {
  const url = `${import.meta.env.VITE_API_URL}/ai/stream`;

  const formData = new FormData();

  formData.append("question", question);
  formData.append("childId", String(childId));
  formData.append("age", String(age));
  formData.append("readingLevel", readingLevel || "");
  formData.append("responseLength", responseLength || "");
  formData.append("learningStyle", learningStyle || "");
  if (interests && interests.length > 0) {
  interests.forEach((interest) => {
    formData.append("interests", interest);
  });
}
  if (conversationId) {
    formData.append(
      "conversationId",
      String(conversationId),
    );
  }

  if (files && files.length > 0) {
    for (const file of files) {
      formData.append("files", file);
    }
  }

  let resp: Response;

  try {
    resp = await fetch(url, {
      method: "POST",
      body: formData,
    });
    console.log("STREAM RESPONSE", resp);
  } catch (e) {
    onError("Network hiccup 💫");
    return;
  }

  if (!resp.ok || !resp.body) {
    onError("Stream failed 💫");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let currentEvent = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, {
      stream: true,
    });

    const lines = buffer.split("\n");

    buffer = lines.pop() || "";

for (const line of lines) {
  const trimmed = line.trim();

  if (!trimmed) continue;

  // EVENT TYPE
  if (trimmed.startsWith("event: ")) {
    currentEvent = trimmed.replace("event: ", "");
  }

  // EVENT DATA
  if (trimmed.startsWith("data: ")) {
    const raw = trimmed.replace("data: ", "");

    // TEXT STREAM
    if (currentEvent === "text") {
      try {
        const chunk = JSON.parse(raw);

        onDelta(chunk);
      } catch {
        onDelta(raw);
      }
    }

    // AUDIO
    else if (currentEvent === "audio") {
      const data = JSON.parse(raw);

      onAudio?.(data.audioUrl);
    }

    // IMAGE
    else if (currentEvent === "image") {
      const data = JSON.parse(raw);

      onImage?.(data.imageUrl);
    }

    // DONE
    else if (currentEvent === "done") {
      onDone();

      return;
    }
  }
}
  }

  onDone();
}


// export async function streamChat({
//   question,
//   childId,
//   conversationId,
//   age,
//   files,
//   onDelta,
//   onDone,
//   onError,
// }: {
//   question: string;
//   childId: number;
//   conversationId?: number;
//   age: number;
//   files?: File[];
//   onDelta: (chunk: string) => void;
//   onDone: (payload: any) => void;
//   onError: (msg: string) => void;
// }) {
//   const url = `${import.meta.env.VITE_API_URL}/ai/stream`;

//   const formData = new FormData();

//   formData.append("question", question);
//   formData.append("childId", String(childId));
//   formData.append("age", String(age));

//   if (conversationId) {
//     formData.append("conversationId", String(conversationId));
//   }

//   if (files?.length) {
//     for (const file of files) {
//       formData.append("files", file);
//     }
//   }

//   let resp: Response;

//   try {
//     resp = await fetch(url, {
//       method: "POST",
//       body: formData,
//     });
//   } catch {
//     onError("Network error 💫");
//     return;
//   }

//   if (!resp.ok || !resp.body) {
//     onError("Stream failed 💫");
//     return;
//   }

//   const reader = resp.body.getReader();
//   const decoder = new TextDecoder();

//   let buffer = "";
//   let currentEvent = "";

//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;

//     buffer += decoder.decode(value, { stream: true });

//     const lines = buffer.split("\n");
//     buffer = lines.pop() || "";

//     for (const line of lines) {
//       const trimmed = line.trim();
//       if (!trimmed) continue;

//       if (trimmed.startsWith("event:")) {
//         currentEvent = trimmed.replace("event: ", "").trim();
//         continue;
//       }

//       if (trimmed.startsWith("data:")) {
//         const raw = trimmed.replace("data: ", "");

//         try {
//           const parsed = JSON.parse(raw);

//           if (currentEvent === "delta") {
//             onDelta(parsed);
//           }

//           if (currentEvent === "done") {
//             onDone(parsed);
//             return;
//           }
//         } catch {
//           // fallback for plain text chunks
//           onDelta(raw);
//         }
//       }
//     }
//   }

//   onDone(null);
// }

export const histoyPage = async (childId:number) =>{
  const r = await fetch(`${import.meta.env.VITE_API_URL}/history/${childId}`,{
    headers:{
      Authorization: localStorage.getItem('accessToken')
        ? `Bearer ${localStorage.getItem('accessToken')}`
        : ''
    }
  });
  const data = await r.json();
  return data.data
}