import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PlayfulBackground from "@/components/PlayfulBackground";

const Login = () => (
  <div className="min-h-screen playful-bg flex items-center justify-center px-4 py-12 relative">
    <PlayfulBackground />
    <div className="w-full max-w-md relative z-10 animate-scale-fade-in">
      <div className="bg-card rounded-3xl shadow-card p-10 text-center border border-border/50">
        <h1 className="text-2xl font-bold text-foreground mb-3">Welcome back! 👋</h1>
        <p className="text-muted-foreground text-sm mb-6">
          The login page is coming soon.
        </p>
        <Link to="/register">
          <Button variant="hero" size="lg" className="w-full">
            Create an Account
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export default Login;
