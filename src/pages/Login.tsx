import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Sparkles, User, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PlayfulBackground from "@/components/PlayfulBackground";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type UserType = "parent" | "child";

// Demo accounts — in real app these come from API
const DEMO_USERS: Record<string, { password: string; type: UserType }> = {
  parent: { password: "parent123", type: "parent" },
  child: { password: "child123", type: "child" },
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("parent");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const [forgotOpen, setForgotOpen] = useState(false);

  const isValid = username.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);

    const account = DEMO_USERS[username.trim().toLowerCase()];
    if (!account || account.password !== password || account.type !== userType) {
      setError("Oops! Username or password is incorrect 😊");
      setShake((k) => k + 1);
      return;
    }

    // Persist session via auth context
    const fakeToken = `demo-token-${Date.now()}`;
    login(fakeToken, account.type, username.trim());

    toast.success(`Welcome back! 👋`, {
      description: account.type === "parent" ? "Heading to your dashboard..." : "Let's keep learning!",
    });

    setTimeout(() => {
      navigate(account.type === "parent" ? "/dashboard" : "/chat");
    }, 400);
  };

  return (
    <div className="min-h-screen playful-bg flex items-center justify-center px-4 py-12 relative">
      <PlayfulBackground />

      <div className="w-full max-w-md relative z-10 animate-fade-slide-up">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button mb-3">
            <Sparkles className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h2 className="text-sm font-semibold text-primary tracking-wide uppercase">
            Little Minds
          </h2>
        </div>

        <div
          key={shake}
          className={cn(
            "bg-card rounded-3xl shadow-card p-8 sm:p-10 border border-border/50",
            shake > 0 && "animate-shake",
          )}
        >
          <div className="text-center mb-7">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back 👋</h1>
            <p className="text-muted-foreground text-sm">
              Login to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                autoComplete="username"
                aria-invalid={!!error}
                className={cn(
                  error &&
                    "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                )}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  className={cn(
                    "pr-12",
                    error &&
                      "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* User type selector */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                <UserTypeOption
                  label="Parent"
                  icon={<User className="w-5 h-5" />}
                  selected={userType === "parent"}
                  onClick={() => setUserType("parent")}
                />
                <UserTypeOption
                  label="Child"
                  icon={<Baby className="w-5 h-5" />}
                  selected={userType === "child"}
                  onClick={() => setUserType("child")}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 animate-fade-slide-up">
                <p className="text-sm text-destructive font-medium text-center">{error}</p>
              </div>
            )}

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm text-primary font-semibold hover:underline underline-offset-4"
              >
                Forgot your password?
              </button>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-2"
              disabled={!isValid || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline underline-offset-4"
            >
              Create new account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          🛡️ Safe, private, and built with love for families.
        </p>

        {/* Demo hint */}
        <div className="mt-4 text-center text-xs text-muted-foreground/80 bg-card/60 rounded-xl px-4 py-2 border border-border/40">
          <span className="font-semibold">Demo:</span> parent / parent123 · child / child123
        </div>
      </div>

      <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  );
};

interface UserTypeOptionProps {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

const UserTypeOption = ({ label, icon, selected, onClick }: UserTypeOptionProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-semibold text-sm transition-all duration-200",
      selected
        ? "border-primary bg-primary/10 text-primary shadow-glow scale-[1.02]"
        : "border-input bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:scale-[1.01]",
    )}
    aria-pressed={selected}
  >
    {icon}
    {label}
  </button>
);

export default Login;
