import { useEffect, useRef, useState } from "react";
import { Camera, Mic, SendHorizonal, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatInputProps {
  // onSend: (text: string) => void;
  onSend: (text: string, files: File[]) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
}

const ChatInput = ({ onSend, disabled, isStreaming, onStop }: ChatInputProps) => {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
const [files, setFiles] = useState<File[]>([]);
const imageInputRef = useRef<HTMLInputElement>(null);
const audioInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [text]);

  const handleSend = () => {
    const t = text.trim();
    if ((!t && files.length === 0) || disabled) return;
    onSend(t, files);
    setText("");
    setFiles([]);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stub = (label: string) =>
    toast(`${label} coming soon ✨`, {
      description: "We're cooking up something playful!",
    });

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-background/80 pt-3 pb-4 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div
          className={cn(
            "flex items-end gap-2 bg-card border-2 border-border/60 rounded-3xl p-2 pl-3 shadow-card transition-all duration-200",
            "focus-within:border-primary focus-within:shadow-glow",
          )}
        >
            {/* IMAGE INPUT */}
  <input
    ref={imageInputRef}
    type="file"
    accept="image/*"
    hidden
    onChange={(e) => {
      const selected = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...selected]);
    }}
  />

  {/* AUDIO INPUT */}
  <input
    ref={audioInputRef}
    type="file"
    accept="audio/*"
    hidden
    onChange={(e) => {
      const selected = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...selected]);
    }}
  />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:scale-110 transition-all shrink-0"
            aria-label="Upload image"
          >
            <Camera className="w-5 h-5" />
          </button>


          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Sparky anything... 🌟"
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground/70 py-2.5 max-h-40 leading-relaxed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:scale-110 transition-all shrink-0"
            aria-label="Record voice"
          >
            <Mic className="w-5 h-5" />
          </button>

          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={onStop}
              className="rounded-2xl h-11 w-11 shrink-0 hover:scale-105 transition-transform"
              aria-label="Stop"
            >
              <Square className="w-5 h-5 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              variant="hero"
              onClick={handleSend}
              disabled={(!text.trim() && files.length === 0) || disabled}
              className="rounded-2xl h-11 w-11 shrink-0"
              aria-label="Send"
            >
              {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
            </Button>
          )}
        </div>
        <p className="text-[11px] text-center text-muted-foreground mt-2">
          🛡️ Sparky keeps things safe & friendly. Always learning together!
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
