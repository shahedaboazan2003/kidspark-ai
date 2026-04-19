import { Link, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayfulBackground from "@/components/PlayfulBackground";

const VerifyEmail = () => {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "your inbox";

  return (
    <div className="min-h-screen playful-bg flex items-center justify-center px-4 py-12 relative">
      <PlayfulBackground />
      <div className="w-full max-w-md relative z-10 animate-scale-fade-in">
        <div className="bg-card rounded-3xl shadow-card p-10 text-center border border-border/50">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Check your email 💌</h1>
          <p className="text-muted-foreground text-sm mb-6">
            We sent a verification link to{" "}
            <span className="font-semibold text-foreground break-all">{email}</span>
          </p>
          <Link to="/register">
            <Button variant="outline" size="lg" className="w-full">
              Back to Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
