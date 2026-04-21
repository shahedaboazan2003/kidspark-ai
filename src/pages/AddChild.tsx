import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Wand2,
  Check,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PlayfulBackground from "@/components/PlayfulBackground";
import AppNavbar from "@/components/AppNavbar";
import { Child, loadChildren } from "@/lib/children";
import { createChild } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Errors {
  name?: string;
  birthDate?: string;
  username?: string;
  password?: string;
  repeatPassword?: string;
}

const generatePassword = (length = 10): string => {
  const lowers = "abcdefghijkmnpqrstuvwxyz";
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = lowers + uppers + digits;
  // Guarantee at least one of each
  const required = [
    lowers[Math.floor(Math.random() * lowers.length)],
    uppers[Math.floor(Math.random() * uppers.length)],
    digits[Math.floor(Math.random() * digits.length)],
  ];
  const rest = Array.from(
    { length: length - required.length },
    () => all[Math.floor(Math.random() * all.length)],
  );
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
};

const AddChild = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<keyof Errors, boolean>>({
    name: false,
    birthDate: false,
    username: false,
    password: false,
    repeatPassword: false,
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwdHighlight, setPwdHighlight] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Existing usernames (simulated uniqueness check)
  const existingUsernames = useMemo(
    () => loadChildren().map((c) => c.username.toLowerCase()),
    [],
  );

  const validate = (): Errors => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Oops! Please enter your child's name 😊";
    if (!birthDate) e.birthDate = "Please pick your child's birth date 🎂";
    else if (birthDate > new Date()) e.birthDate = "Birth date can't be in the future 🙂";

    if (!username.trim()) e.username = "Please choose a friendly username ✨";
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim()))
      e.username = "3-30 letters, numbers or _ only 🙏";
    else if (existingUsernames.includes(username.trim().toLowerCase()))
      e.username = "This username is already taken 😅";

    if (!password) e.password = "Please set a password 🔒";
    else if (password.length < 6) e.password = "Password needs at least 6 characters 🔒";
    else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
      e.password = "Mix in some letters and numbers 🔡";

    if (!repeatPassword) e.repeatPassword = "Please repeat the password 🔁";
    else if (password !== repeatPassword)
      e.repeatPassword = "Passwords don't match, try again 💫";

    return e;
  };

  const liveErrors = validate();
  const isValid = Object.keys(liveErrors).length === 0;

  const showError = (key: keyof Errors) => touched[key] && (errors[key] || liveErrors[key]);

  const markTouched = (key: keyof Errors) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate());
  };

  const handleGeneratePassword = () => {
    const pwd = generatePassword(10);
    setPassword(pwd);
    setRepeatPassword(pwd);
    setShowPwd(true);
    setPwdHighlight(true);
    setTouched((t) => ({ ...t, password: true, repeatPassword: true }));
    setErrors(validate());
    setTimeout(() => setPwdHighlight(false), 1200);
    toast.success("Password generated! 🔐", {
      description: "We auto-filled both password fields for you.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setTouched({
      name: true,
      birthDate: true,
      username: true,
      password: true,
      repeatPassword: true,
    });
    if (Object.keys(v).length > 0) return;

    setSubmitError("");
    setLoading(true);
    try {
      await createChild({
        name: name.trim(),
        username: username.trim(),
        password,
        birthdate: format(birthDate!, "yyyy-MM-dd"),
        firstName: name.trim().split(" ")[0],
        lastName: name.trim().split(" ").slice(1).join(" "),
      });
      setLoading(false);
      setSuccessOpen(true);
    } catch (err) {
      setLoading(false);
      const code = (err as Error).message;
      setSubmitError(
        code === "USERNAME_TAKEN"
          ? "This username is already taken 😅"
          : "Something went wrong, please try again 💫",
      );
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 playful-bg opacity-60" aria-hidden />
      <PlayfulBackground />

      <div className="relative z-10">
        <AppNavbar />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Back link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-card rounded-3xl shadow-card p-6 sm:p-10 border border-border/50 animate-fade-slide-up">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Add a New Child 🧸
              </h1>
              <p className="text-muted-foreground text-sm">
                Create a safe learning profile for your child
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Child Name */}
              <div className="space-y-1.5">
                <Label htmlFor="child-name" className="text-sm font-semibold">
                  Child Name
                </Label>
                <Input
                  id="child-name"
                  type="text"
                  placeholder="e.g. Emma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (touched.name) setErrors(validate());
                  }}
                  onBlur={() => markTouched("name")}
                  aria-invalid={!!showError("name")}
                  className={cn(
                    showError("name") &&
                      "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                  )}
                />
                {showError("name") && (
                  <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                    {showError("name")}
                  </p>
                )}
              </div>

              {/* Birth Date */}
              <div className="space-y-1.5">
                <Label htmlFor="child-birthdate" className="text-sm font-semibold">
                  Birth Date
                </Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      id="child-birthdate"
                      type="button"
                      onBlur={() => markTouched("birthDate")}
                      className={cn(
                        "flex h-12 w-full items-center justify-between rounded-xl border-2 border-input bg-card px-4 text-base text-left transition-all duration-200",
                        "hover:border-primary/40 focus:outline-none focus:border-primary focus:shadow-glow",
                        !birthDate && "text-muted-foreground/70",
                        showError("birthDate") &&
                          "border-destructive focus:border-destructive focus:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                      )}
                    >
                      <span>
                        {birthDate ? format(birthDate, "PPP") : "Pick a birth date"}
                      </span>
                      <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-2xl border-border/50 shadow-card"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={(d) => {
                        setBirthDate(d);
                        setTouched((t) => ({ ...t, birthDate: true }));
                        setDatePickerOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      defaultMonth={birthDate ?? new Date(2018, 0)}
                      captionLayout="dropdown-buttons"
                      fromYear={1990}
                      toYear={new Date().getFullYear()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {showError("birthDate") && (
                  <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                    {showError("birthDate")}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="child-username" className="text-sm font-semibold">
                  Username
                </Label>
                <Input
                  id="child-username"
                  type="text"
                  placeholder="e.g. emma_explorer"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (touched.username) setErrors(validate());
                  }}
                  onBlur={() => markTouched("username")}
                  aria-invalid={!!showError("username")}
                  className={cn(
                    showError("username") &&
                      "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                  )}
                />
                {showError("username") && (
                  <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                    {showError("username")}
                  </p>
                )}
              </div>

              {/* Generate password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 hover:scale-[1.03] transition-all px-3 py-1.5 rounded-full"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Generate Strong Password 🔐
                </button>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="child-password" className="text-sm font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="child-password"
                    type={showPwd ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password || touched.repeatPassword) setErrors(validate());
                    }}
                    onBlur={() => markTouched("password")}
                    aria-invalid={!!showError("password")}
                    className={cn(
                      "pr-12 transition-all",
                      pwdHighlight &&
                        "border-success shadow-[0_0_0_4px_hsl(var(--success)/0.2)]",
                      showError("password") &&
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
                {showError("password") && (
                  <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                    {showError("password")}
                  </p>
                )}
              </div>

              {/* Repeat Password */}
              <div className="space-y-1.5">
                <Label htmlFor="child-repeat" className="text-sm font-semibold">
                  Repeat Password
                </Label>
                <Input
                  id="child-repeat"
                  type={showPwd ? "text" : "password"}
                  placeholder="Type the password again"
                  value={repeatPassword}
                  onChange={(e) => {
                    setRepeatPassword(e.target.value);
                    if (touched.repeatPassword) setErrors(validate());
                  }}
                  onBlur={() => markTouched("repeatPassword")}
                  aria-invalid={!!showError("repeatPassword")}
                  className={cn(
                    "transition-all",
                    pwdHighlight &&
                      "border-success shadow-[0_0_0_4px_hsl(var(--success)/0.2)]",
                    showError("repeatPassword") &&
                      "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                  )}
                />
                {showError("repeatPassword") && (
                  <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                    {showError("repeatPassword")}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 animate-fade-slide-up">
                  <p className="text-sm text-destructive font-medium text-center">
                    {submitError}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full mt-4"
                disabled={!isValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating profile...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Add Child
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            🛡️ Profiles are private and protected by your parent account.
          </p>
        </main>
      </div>

      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={(o) => !o && handleSuccessClose()}>
        <DialogContent className="sm:max-w-sm rounded-3xl border-border/50 shadow-card text-center">
          <DialogHeader className="items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-success to-secondary flex items-center justify-center shadow-button mb-2 animate-scale-fade-in">
              <PartyPopper className="w-10 h-10 text-primary-foreground" strokeWidth={2.2} />
            </div>
            <DialogTitle className="text-2xl">Child Added Successfully 🎉</DialogTitle>
            <DialogDescription>
              Your child profile has been created safely.
            </DialogDescription>
          </DialogHeader>
          <Button variant="hero" size="lg" className="w-full mt-2" onClick={handleSuccessClose}>
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddChild;
