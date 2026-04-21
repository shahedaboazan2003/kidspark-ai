import { Link } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import PlayfulBackground from "@/components/PlayfulBackground";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  title: string;
  emoji: string;
  description: string;
}

const ComingSoon = ({ title, emoji, description }: ComingSoonProps) => (
  <div className="min-h-screen bg-background relative">
    <div className="absolute inset-0 playful-bg opacity-60" aria-hidden />
    <PlayfulBackground />
    <div className="relative z-10">
      <AppNavbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="bg-card rounded-3xl shadow-card p-10 border border-border/50 text-center animate-fade-slide-up">
          <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-button mx-auto mb-5 text-4xl">
            {emoji}
          </div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground mb-6">{description}</p>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-foreground bg-accent/30 px-3 py-1.5 rounded-full mb-6">
            <Construction className="w-3.5 h-3.5" />
            Coming soon
          </div>
          <div>
            <Button asChild variant="hero" size="lg">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default ComingSoon;
