import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const MessageBubble = ({ role, content, isStreaming }: MessageBubbleProps) => {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex items-end gap-2 animate-fade-slide-up",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-button",
          isUser ? "bg-secondary" : "bg-gradient-primary",
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" strokeWidth={2.5} />
        ) : (
          <Bot className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[75%] px-4 py-3 shadow-soft border",
          isUser
            ? "bg-gradient-primary text-primary-foreground border-transparent rounded-2xl rounded-br-sm"
            : "bg-card text-card-foreground border-border/50 rounded-2xl rounded-bl-sm",
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed prose-strong:text-primary prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown>{content || "…"}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 align-middle animate-pulse rounded-sm" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
