import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
}

const OtpInput = ({ value, onChange, length = 6, disabled, hasError }: OtpInputProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusAt = (i: number) => {
    const el = refs.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      // Clear current
      const next = digits.slice();
      next[i] = "";
      onChange(next.join(""));
      return;
    }
    // Support paste-like multi-char into one box
    const next = digits.slice();
    let cursor = i;
    for (const ch of raw) {
      if (cursor >= length) break;
      next[cursor] = ch;
      cursor++;
    }
    onChange(next.join(""));
    focusAt(Math.min(cursor, length - 1));
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = digits.slice();
        next[i] = "";
        onChange(next.join(""));
      } else if (i > 0) {
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < length - 1) {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    onChange(text.padEnd(value.length, "").slice(0, length));
    focusAt(Math.min(text.length, length - 1));
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold rounded-xl border-2 bg-card transition-all duration-200",
            "focus:outline-none focus:border-primary focus:shadow-glow focus:scale-105",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            hasError
              ? "border-destructive text-destructive"
              : d
                ? "border-primary text-primary"
                : "border-input text-foreground",
          )}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
