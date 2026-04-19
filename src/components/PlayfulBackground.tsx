import { Cloud, Star, Circle } from "lucide-react";

const PlayfulBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Soft gradient blobs */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-40 animate-float"
        style={{ background: "radial-gradient(circle, hsl(var(--primary-glow)) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full opacity-40 animate-float"
        style={{
          background: "radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)",
          animationDelay: "2s",
        }}
      />
      <div
        className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full opacity-30 animate-float"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
          animationDelay: "4s",
        }}
      />

      {/* Playful icons */}
      <Cloud
        className="absolute top-16 right-20 w-16 h-16 text-primary/30 animate-float"
        style={{ animationDelay: "1s" }}
        strokeWidth={1.5}
      />
      <Star
        className="absolute top-32 left-1/3 w-10 h-10 text-accent/60 animate-float"
        style={{ animationDelay: "3s" }}
        fill="currentColor"
      />
      <Star
        className="absolute bottom-24 right-1/4 w-8 h-8 text-secondary/50 animate-float"
        style={{ animationDelay: "2.5s" }}
        fill="currentColor"
      />
      <Circle
        className="absolute bottom-40 left-16 w-12 h-12 text-primary/30 animate-float"
        style={{ animationDelay: "1.5s" }}
        fill="currentColor"
      />
      <Cloud
        className="absolute bottom-20 left-1/2 w-20 h-20 text-secondary/30 animate-float"
        style={{ animationDelay: "3.5s" }}
        strokeWidth={1.5}
      />
      <Star
        className="absolute top-1/2 right-12 w-6 h-6 text-accent/70 animate-float"
        style={{ animationDelay: "0.5s" }}
        fill="currentColor"
      />
    </div>
  );
};

export default PlayfulBackground;
