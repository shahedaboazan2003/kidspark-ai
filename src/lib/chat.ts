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
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  title: string;
  client_id: string;
  created_at: string;
  updated_at: string;
};

export const listConversations = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations`);
  return res.json();
};

export const createConversation = async (title = "New chat") => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return res.json();
};

export const renameConversation = async (id: string, title: string) => {
  await fetch(`${import.meta.env.VITE_API_URL}/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
};

export const deleteConversation = async (id: string) => {
  await fetch(`${import.meta.env.VITE_API_URL}/conversations/${id}`, {
    method: "DELETE",
  });
};

export const listMessages = async (conversationId: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/messages/${conversationId}`,
  );
  return res.json();
};

export const insertMessage = async (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, role, content }),
  });
  return res.json();
};

export const updateMessageContent = async (id: string, content: string) => {
  await fetch(`${import.meta.env.VITE_API_URL}/messages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
};

/** Stream chat response token-by-token from the edge function. */
export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: "user" | "assistant"; content: string }[];
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const url = `${import.meta.env.VITE_API_URL}/chat`;
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });
  } catch (e) {
    onError("Network hiccup — please try again 💫");
    return;
  }

  if (!resp.ok || !resp.body) {
    // 400–499 Client errors
    if (resp.status >= 400 && resp.status < 500) {
      if (resp.status === 429)
        onError("Whoa, lots of questions! Please wait a moment 💛");
      else if (resp.status === 402)
        onError("AI credits ran out. Add funds in workspace settings.");
      else onError("Client error — please check your request 💫");
    }

    // 500–599 Server errors
    else if (resp.status >= 500) {
      onError("Server issue — try again later 💫");
    }

    // fallback
    else {
      onError("Something went wrong — please try again 💫");
    }

    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });
    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as
          | string
          | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as
          | string
          | undefined;
        if (content) onDelta(content);
      } catch {
        /* ignore */
      }
    }
  }
  onDone();
}
