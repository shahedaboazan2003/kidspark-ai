import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Sparkles, UserCog, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PlayfulBackground from "@/components/PlayfulBackground";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth, UserType } from "@/contexts/AuthContext";
// import { login as apiLogin } from "@/lib/api";
import { login as apiLogin } from "@/lib/auth.remote";
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserType | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
    role?: string;
  }>({});
  const [shake, setShake] = useState(0);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Client-side validation
    const errs: typeof fieldErrors = {};
    if (!username.trim()) errs.username = "Username is required";
    if (!password) errs.password = "Password is required";
    if (!role) errs.role = "Please select a role";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("");
      setShake((k) => k + 1);
      return;
    }

    setFieldErrors({});
    setError("");
    setLoading(true);

    try {
      const res = await apiLogin(username.trim(), password);
      // حفظ التوكن
      localStorage.setItem("token", res.access_token);
      // حفظ بيانات المستخدم (اختياري)
      login(res.accessToken, res.userType, res.username, res.firstName);

      toast.success(`Welcome back, ${res.firstName || res.username}! 👋`, {
        description:
          res.userType === "parent"
            ? "Heading to your dashboard..."
            : "Let's keep learning!",
      });

      setTimeout(() => {
        navigate(res.userType === "parent" ? "/dashboard" : "/chat");
      }, 350);
    } catch (e) {
      console.error(e);
      const code = (e as Error).message;
      const msg =
        code === "EMAIL_NOT_VERIFIED"
          ? "Please verify your email first 💌"
          : code === "ROLE_MISMATCH"
            ? `This account isn't a ${role} account. Please pick the correct role.`
            : "Invalid username or password 😕";
      setError(msg);
      setShake((k) => k + 1);
      setLoading(false);
    }
  };

  const clearField = (key: "username" | "password" | "role") => {
    if (fieldErrors[key]) setFieldErrors((f) => ({ ...f, [key]: undefined }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen playful-bg flex items-center justify-center px-4 py-12 relative">
      <PlayfulBackground />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle className="bg-card/70 backdrop-blur border border-border/50" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-slide-up">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button mb-3">
            <Sparkles
              className="w-8 h-8 text-primary-foreground"
              strokeWidth={2.5}
            />
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome Back 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              Login to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  clearField("username");
                }}
                autoComplete="username"
                aria-invalid={!!fieldErrors.username || !!error}
                disabled={loading}
                className={cn(
                  (fieldErrors.username || error) &&
                    "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                )}
              />
              {fieldErrors.username && (
                <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                  {fieldErrors.username}
                </p>
              )}
            </div>

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
                    clearField("password");
                  }}
                  autoComplete="current-password"
                  aria-invalid={!!fieldErrors.password || !!error}
                  disabled={loading}
                  className={cn(
                    "pr-12",
                    (fieldErrors.password || error) &&
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
                  {showPwd ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Role selector */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                I am a... <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard
                  selected={role === "parent"}
                  invalid={!!fieldErrors.role}
                  onClick={() => {
                    setRole("parent");
                    clearField("role");
                  }}
                  icon={UserCog}
                  emoji="👨‍👩‍👧"
                  title="Parent"
                  subtitle="Manage children"
                  disabled={loading}
                />
                <RoleCard
                  selected={role === "child"}
                  invalid={!!fieldErrors.role}
                  onClick={() => {
                    setRole("child");
                    clearField("role");
                  }}
                  icon={Baby}
                  emoji="🧒"
                  title="Child"
                  subtitle="Learn & explore"
                  disabled={loading}
                />
              </div>
              {fieldErrors.role && (
                <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                  {fieldErrors.role}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 animate-fade-slide-up">
                <p className="text-sm text-destructive font-medium text-center">
                  {error}
                </p>
              </div>
            )}

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
              disabled={loading}
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

        <div className="mt-4 text-center text-xs text-muted-foreground/80 bg-card/60 rounded-xl px-4 py-2 border border-border/40">
          <span className="font-semibold">Demo:</span> parent / parent123 ·
          child / child123
        </div>
      </div>

      <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  );
};

interface RoleCardProps {
  selected: boolean;
  invalid: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  title: string;
  subtitle: string;
  disabled?: boolean;
}

const RoleCard = ({
  selected,
  invalid,
  onClick,
  icon: Icon,
  emoji,
  title,
  subtitle,
  disabled,
}: RoleCardProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={selected}
    className={cn(
      "relative flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-4 transition-all duration-200 text-center",
      "hover:scale-[1.02] hover:border-primary/60 active:scale-95",
      selected
        ? "border-primary bg-primary/10 shadow-soft"
        : invalid
          ? "border-destructive/60 bg-card"
          : "border-input bg-card",
      disabled && "opacity-60 cursor-not-allowed hover:scale-100",
    )}
  >
    <div className="text-2xl leading-none mb-0.5">{emoji}</div>
    <div
      className={cn(
        "font-bold text-sm",
        selected ? "text-primary" : "text-foreground",
      )}
    >
      {title}
    </div>
    <div className="text-[11px] text-muted-foreground leading-tight">
      {subtitle}
    </div>
    {selected && (
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-scale-fade-in" />
    )}
  </button>
);

export default Login;
