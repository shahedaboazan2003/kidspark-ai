import { Bot } from "lucide-react";

const TypingIndicator = () => (
  <div className="flex items-end gap-2 animate-fade-slide-up">
    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-button shrink-0">
      <Bot className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
    </div>
    <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
