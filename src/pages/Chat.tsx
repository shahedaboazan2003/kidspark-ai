import { useEffect, useRef, useState, useCallback } from "react";
import {  useParams } from "react-router-dom";
import { Menu, Sparkles, Bot } from "lucide-react";
import { toast } from "sonner";
import PlayfulBackground from "@/components/PlayfulBackground";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatInput from "@/components/chat/ChatInput";
import ChatTopControls from "@/components/chat/ChatTopControls";
import { useAuth } from "@/contexts/AuthContext";
import {
  Conversation,
  AskMessage,
  createConversation,
  deleteConversation as dbDeleteConversation,
  listConversations,
  listMessages,
  streamChat,
} from "@/lib/chat";

type UiMessage = {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  audioUrl?: string;
  imageUrl?: string;
};

const SUGGESTED = [
  { emoji: "🌍", text: "Why is the sky blue?" },
  { emoji: "🦖", text: "Tell me a fun fact about dinosaurs!" },
  { emoji: "🚀", text: "How do rockets fly to space?" },
  { emoji: "🐙", text: "Why do octopuses have 8 arms?" },
];

const Chat = () => {
  const { id: routeConvoId } = useParams<{ id?: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<{ aborted: boolean }>({ aborted: false });
  const { user } = useAuth();

  //get all conversations on load + when route param changes
  // useEffect(() => {
  //   if (!user) return;
  //   (async () => {
  //     try {
  //       const list = await listConversations(user!.id);
  //       setConversations(list);
  //       // Prefer conversation from URL param, else first in list
  //       if (routeConvoId && list.find((c) => c.id === Number(routeConvoId))) {
  //         setActiveId(Number(routeConvoId));
  //         console.log("activatedd id :" , activeId , "routtteid:" , routeConvoId)
  //       } else if (list.length > 0) {
  //         setActiveId(list[0].id);
  //       }
  //     } catch {
  //       toast.error("Couldn't load chats", {
  //         description: "Please refresh and try again 💫",
  //       });
  //     } finally {
  //       setLoadingConvos(false);
  //     }
  //   })();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [routeConvoId, user]);

    useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const list = await listConversations(user.id);
        setConversations(list);
      } catch {
        toast.error("Couldn't load chats");
      } finally {
        setLoadingConvos(false);
      }
    })();
  }, [user]);


  useEffect(() => {
    if (routeConvoId ) {
      setActiveId(Number(routeConvoId));
    } else if (conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [routeConvoId, conversations]);

  // Load messages when active conversation changes
  // TODO: fix messages state here
  useEffect(() => {
    if (!activeId || streaming) return;
    console.log("activ id",activeId)
    setLoadingMsgs(true);
    (async () => {
      try {
        const msgs: AskMessage[] = await listMessages(activeId);
        console.log("messageeeee",msgs)
        // setMessages(msgs.map((m: DbMessage) => ({ id: m.id, role: m.role, content: m.content })));
        setMessages(
          msgs.flatMap((m) => [
            {
              id: `q_${m.id}`,
              role: "user",
              content: m.question,
            },
            {
              id: `a_${m.id}`,
              role: "assistant",
              content: m.answer,
              audioUrl: m.audioUrl,
              imageUrl: m.imageUrl,
            },
          ]),
        );
      } catch {
        toast.error("Couldn't load messages 💫");
      } finally {
        setLoadingMsgs(false);
      }
    })();
  }, [activeId, streaming]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleNew = useCallback(() => {
    setActiveId(null);
    setMessages([]);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await dbDeleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeId === id) {
          setActiveId(null);
          setMessages([]);
        }
        toast.success("Chat removed");
      } catch {
        toast.error("Couldn't delete chat 💫");
      }
    },
    [activeId],
  );

  const handleSend = async (text: string, files: File[] = []) => {
    if (!user) return;
    let convoId = activeId;
    // Auto-create conversation if none active
    if (!convoId) {
      try {
        const c = await createConversation(text.slice(0, 40));
        setConversations((prev) => [c, ...prev]);
        setActiveId(c.id);
        convoId = c.id;
      } catch {
        toast.error("Couldn't start chat 💫");
        return;
      }
    }

    // Persist user message + optimistic UI
    const optimisticUser: UiMessage = {
      id: `tmp_${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, optimisticUser]);

    // Add empty assistant placeholder
    const assistantTmpId = `asst_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantTmpId, role: "assistant", content: "", streaming: true },
    ]);
    setStreaming(true);
    abortRef.current = { aborted: false };

    let acc = "";
    await streamChat({
      question: text,
      childId: user!.id,
      conversationId: convoId!,
      age: 10,
      readingLevel:
        localStorage.getItem("readingLevel") || "",

      responseLength:
        localStorage.getItem("responseLength") || "",

      learningStyle:
        localStorage.getItem("learningStyle") || "",

      interests:
        JSON.parse(localStorage.getItem("interests") || "[]"),
      files,
      onDelta: (chunk) => {
        if (abortRef.current.aborted) return;
        acc += chunk;
        setMessages((prev) => {
          const newMessages = prev.map((m) =>
            m.id === assistantTmpId ? { ...m, content: acc } : m,
          );
          return newMessages;
        });
      },
      onDone: async () => {
        setStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantTmpId ? { ...m, streaming: false } : m,
          ),
        );
      },
      onError: (msg) => {
        setStreaming(false);
        setMessages((prev) => prev.filter((m) => m.id !== assistantTmpId));
        toast.error(msg);
      },
      onAudio: (audioUrl) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantTmpId ? { ...m, audioUrl } : m)),
        );
      },

      onImage: (imageUrl) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantTmpId ? { ...m, imageUrl } : m)),
        );
      },

      
    });
  };

  const handleStop = () => {
    abortRef.current.aborted = true;
    setStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    );
  };

  const showEmpty = !loadingMsgs && messages.length === 0;

  return (
    <div className="min-h-screen bg-background relative flex">
      <div
        className="absolute inset-0 playful-bg opacity-40 pointer-events-none"
        aria-hidden
      />
      <PlayfulBackground />

      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNew}
        onDelete={handleDelete}
        loading={loadingConvos}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-card/80 backdrop-blur border-b border-border/50 px-3 py-2.5 flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Open chats"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-button">
              <Sparkles
                className="w-4 h-4 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
            <span className="font-bold">Sparky</span>
          </div>
          <ChatTopControls className="ml-auto" />
        </header>

        {/* Desktop floating controls (theme + logout) */}
        <div className="hidden lg:flex absolute top-4 right-4 z-30 animate-fade-slide-up">
          <ChatTopControls />
        </div>

        {/* Messages scroll area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-6"
        >
          <div className="max-w-3xl mx-auto space-y-4">
            {loadingMsgs ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="h-16 flex-1 max-w-md rounded-2xl bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : showEmpty ? (
              <div className="flex flex-col items-center text-center py-12 animate-fade-slide-up">
                <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-card mb-5">
                  <Bot
                    className="w-10 h-10 text-primary-foreground"
                    strokeWidth={2.2}
                  />
                </div>
                <h1 className="text-3xl font-bold mb-2">Hi! I'm Sparky 👋</h1>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Ask me anything — I love stories, science, animals, space, and
                  big questions!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => handleSend(s.text)}
                      disabled={streaming}
                      className="text-left p-4 rounded-2xl bg-card border-2 border-border/60 hover:border-primary/50 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-2xl mb-1">{s.emoji}</div>
                      <div className="text-sm font-semibold">{s.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    role={m.role}
                    content={m.content}
                    isStreaming={m.streaming}
                    audioUrl={m.audioUrl}
                    imageUrl={m.imageUrl}
                  />
                ))}
                {streaming && messages[messages.length - 1]?.content === "" && (
                  <TypingIndicator />
                )}
              </>
            )}
          </div>
        </div>

        <ChatInput
          onSend={handleSend}
          disabled={streaming}
          isStreaming={streaming}
          onStop={handleStop}
        />
      </div>
    </div>
  );
};

export default Chat;
