import { Sparkles } from "lucide-react";

const LoadingScreen = () => (
  <div className="min-h-screen playful-bg flex flex-col items-center justify-center gap-4">
    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button animate-pulse">
      <Sparkles className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
    </div>
    <p className="text-sm font-semibold text-muted-foreground">Loading your space...</p>
  </div>
);

export default LoadingScreen;
