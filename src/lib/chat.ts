import { supabase } from "@/integrations/supabase/client";

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

export const listConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("client_id", getClientId())
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Conversation[];
};

export const createConversation = async (title = "New chat"): Promise<Conversation> => {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ client_id: getClientId(), title })
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
};

export const renameConversation = async (id: string, title: string) => {
  await supabase.from("conversations").update({ title, updated_at: new Date().toISOString() }).eq("id", id);
};

export const deleteConversation = async (id: string) => {
  await supabase.from("conversations").delete().eq("id", id);
};

export const listMessages = async (conversationId: string): Promise<DbMessage[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DbMessage[];
};

export const insertMessage = async (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
): Promise<DbMessage> => {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();
  if (error) throw error;
  // bump conversation updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
  return data as DbMessage;
};

export const updateMessageContent = async (id: string, content: string) => {
  await supabase.from("messages").update({ content }).eq("id", id);
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
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });
  } catch (e) {
    onError("Network hiccup — please try again 💫");
    return;
  }

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) onError("Whoa, lots of questions! Please wait a moment 💛");
    else if (resp.status === 402) onError("AI credits ran out. Add funds in workspace settings.");
    else onError("Something went wrong — please try again 💫");
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
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
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
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        /* ignore */
      }
    }
  }
  onDone();
}
