import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative w-10 h-10 rounded-xl flex items-center justify-center text-foreground hover:bg-muted/60 transition-all duration-300 hover:scale-110 active:scale-95",
        className,
      )}
    >
      <Sun
        className={cn(
          "w-5 h-5 absolute transition-all duration-500",
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100",
        )}
      />
      <Moon
        className={cn(
          "w-5 h-5 absolute transition-all duration-500",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50",
        )}
      />
    </button>
  );
};

export default ThemeToggle;
