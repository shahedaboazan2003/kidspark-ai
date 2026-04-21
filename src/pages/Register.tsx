import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/validation";
import PlayfulBackground from "@/components/PlayfulBackground";
import { cn } from "@/lib/utils";
import { registerParent } from "@/lib/api";
import { toast } from "sonner";

type Errors = Partial<Record<keyof FormState, string>>;

interface FormState {
  email: string;
  password: string;
  repeatPassword: string;
  username: string;
  firstName: string;
  lastName: string;
}

const initial: FormState = {
  email: "",
  password: "",
  repeatPassword: "",
  username: "",
  firstName: "",
  lastName: "",
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const validate = (data: FormState): Errors => {
    const result = registerSchema.safeParse(data);
    if (result.success) return {};
    const fieldErrors: Errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FormState;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fieldErrors;
  };

  const liveErrors = validate(form);
  const isValid = Object.keys(liveErrors).length === 0;

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (touched[key]) {
      setErrors(validate({ ...form, [key]: value }));
    }
  };

  const handleBlur = (key: keyof FormState) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    setTouched({
      email: true,
      password: true,
      repeatPassword: true,
      username: true,
      firstName: true,
      lastName: true,
    });
    if (Object.keys(v).length > 0) {
      setShakeKey((k) => k + 1);
      return;
    }
    setLoading(true);
    try {
      await registerParent({
        username: form.username.trim(),
        password: form.password,
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      setLoading(false);
      navigate("/verify-email", {
        state: { email: form.email, username: form.username.trim() },
      });
    } catch (err) {
      setLoading(false);
      const code = (err as Error).message;
      const msg =
        code === "USERNAME_TAKEN"
          ? "That username is already taken 😅"
          : code === "EMAIL_TAKEN"
            ? "An account with this email already exists 💌"
            : "Something went wrong, please try again 💫";
      toast.error(msg);
      setShakeKey((k) => k + 1);
    }
  };

  const showError = (key: keyof FormState) => touched[key] && errors[key];

  return (
    <div className="min-h-screen playful-bg flex items-center justify-center px-4 py-12 relative">
      <PlayfulBackground />

      <div className="w-full max-w-md relative z-10 animate-fade-slide-up">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button mb-3">
            <Sparkles className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h2 className="text-sm font-semibold text-primary tracking-wide uppercase">
            Little Minds
          </h2>
        </div>

        <div
          key={shakeKey}
          className={cn(
            "bg-card rounded-3xl shadow-card p-8 sm:p-10 border border-border/50",
            shakeKey > 0 && "animate-shake",
          )}
        >
          <div className="text-center mb-7">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Parent Account
            </h1>
            <p className="text-muted-foreground text-sm">
              Start your child's learning journey ✨
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="parent@example.com"
              value={form.email}
              onChange={(v) => update("email", v)}
              onBlur={() => handleBlur("email")}
              error={showError("email")}
              autoComplete="email"
            />

            <Field
              id="password"
              label="Password"
              type={showPwd ? "text" : "password"}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(v) => update("password", v)}
              onBlur={() => handleBlur("password")}
              error={showError("password")}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Field
              id="repeatPassword"
              label="Repeat Password"
              type={showRepeat ? "text" : "password"}
              placeholder="Type your password again"
              value={form.repeatPassword}
              onChange={(v) => update("repeatPassword", v)}
              onBlur={() => handleBlur("repeatPassword")}
              error={showError("repeatPassword")}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowRepeat((s) => !s)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showRepeat ? "Hide password" : "Show password"}
                >
                  {showRepeat ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Field
              id="username"
              label="Username"
              type="text"
              placeholder="Pick a friendly username"
              value={form.username}
              onChange={(v) => update("username", v)}
              onBlur={() => handleBlur("username")}
              error={showError("username")}
              autoComplete="username"
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                id="firstName"
                label="First Name"
                type="text"
                placeholder="Jane"
                value={form.firstName}
                onChange={(v) => update("firstName", v)}
                onBlur={() => handleBlur("firstName")}
                error={showError("firstName")}
                autoComplete="given-name"
              />
              <Field
                id="lastName"
                label="Last Name"
                type="text"
                placeholder="Doe"
                value={form.lastName}
                onChange={(v) => update("lastName", v)}
                onBlur={() => handleBlur("lastName")}
                error={showError("lastName")}
                autoComplete="family-name"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-6"
              disabled={!isValid || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline underline-offset-4"
            >
              Login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          🛡️ Safe, private, and built with love for families.
        </p>
      </div>
    </div>
  );
};

interface FieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string | false;
  autoComplete?: string;
  rightIcon?: React.ReactNode;
}

const Field = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  rightIcon,
}: FieldProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-semibold text-foreground">
      {label}
    </Label>
    <div className="relative">
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={cn(
          rightIcon && "pr-12",
          error && "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
        )}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>
      )}
    </div>
    {error && (
      <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
        {error}
      </p>
    )}
  </div>
);

export default Register;
