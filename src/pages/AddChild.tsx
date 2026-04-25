import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Wand2,
  Check,
  PartyPopper,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PlayfulBackground from "@/components/PlayfulBackground";
import AppNavbar from "@/components/AppNavbar";
import { Child, loadChildren, calcAge } from "@/lib/children";
import { createChild, updateChild } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Errors {
  firstName?: string;
  lastName?: string;
  age?: string;
  username?: string;
  password?: string;
  repeatPassword?: string;
}

const generatePassword = (length = 10): string => {
  const lowers = "abcdefghijkmnpqrstuvwxyz";
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = lowers + uppers + digits;
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

/** Convert age to a synthetic ISO birthdate (Jan 1 of birth year) so the
 *  rest of the app (which still uses `birthdate`) keeps working. */
const ageToBirthdate = (age: number): string => {
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
};

const AddChild = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id?: string }>();

  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const isEditMode = !!editingChild;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState<string>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<keyof Errors, boolean>>({
    firstName: false,
    lastName: false,
    age: false,
    username: false,
    password: false,
    repeatPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [pwdHighlight, setPwdHighlight] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load child to edit if route param present
  useEffect(() => {
    if (!editId) {
      setEditingChild(null);
      return;
    }
    const all = loadChildren();
    const child = all.find((c) => c.id === editId);
    if (!child) {
      toast.error("Child not found 😕");
      navigate("/dashboard", { replace: true });
      return;
    }
    setEditingChild(child);
    setFirstName(child.firstName ?? child.name.split(" ")[0] ?? "");
    setLastName(child.lastName ?? child.name.split(" ").slice(1).join(" ") ?? "");
    setAge(String(calcAge(child.birthdate)));
    setUsername(child.username);
    setPassword("");
    setRepeatPassword("");
    setTouched({
      firstName: false,
      lastName: false,
      age: false,
      username: false,
      password: false,
      repeatPassword: false,
    });
  }, [editId, navigate]);

  // Existing usernames (excluding the one we're editing) for uniqueness
  const existingUsernames = useMemo(
    () =>
      loadChildren()
        .filter((c) => c.id !== editingChild?.id)
        .map((c) => c.username.toLowerCase()),
    [editingChild],
  );

  const validate = (): Errors => {
    const e: Errors = {};
    if (!firstName.trim()) e.firstName = "First name is required 🌟";
    if (!lastName.trim()) e.lastName = "Last name is required 🌟";

    const ageNum = Number(age);
    if (!age.toString().trim()) e.age = "Please enter age 🎂";
    else if (!Number.isInteger(ageNum) || ageNum < 3 || ageNum > 15)
      e.age = "Age must be between 3 and 15 🙂";

    if (!username.trim()) e.username = "Please choose a friendly username ✨";
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim()))
      e.username = "3-30 letters, numbers or _ only 🙏";
    else if (existingUsernames.includes(username.trim().toLowerCase()))
      e.username = "This username is already taken 😅";

    // Password is required in Add mode; optional in Edit mode
    if (!isEditMode) {
      if (!password) e.password = "Please set a password 🔒";
      else if (password.length < 6) e.password = "Password needs at least 6 characters 🔒";

      if (!repeatPassword) e.repeatPassword = "Please repeat the password 🔁";
      else if (password !== repeatPassword)
        e.repeatPassword = "Passwords don't match, try again 💫";
    } else {
      // Optional in edit mode, but if any value is typed validate them
      if (password || repeatPassword) {
        if (password.length < 6) e.password = "Password needs at least 6 characters 🔒";
        if (password !== repeatPassword)
          e.repeatPassword = "Passwords don't match, try again 💫";
      }
    }

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

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setAge("");
    setUsername("");
    setPassword("");
    setRepeatPassword("");
    setErrors({});
    setTouched({
      firstName: false,
      lastName: false,
      age: false,
      username: false,
      password: false,
      repeatPassword: false,
    });
  };

  const handleCancelEdit = () => {
    setEditingChild(null);
    resetForm();
    navigate("/add-child", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setTouched({
      firstName: true,
      lastName: true,
      age: true,
      username: true,
      password: true,
      repeatPassword: true,
    });
    if (Object.keys(v).length > 0) return;

    setSubmitError("");
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const birthdate = ageToBirthdate(Number(age));

      if (isEditMode && editingChild) {
        await updateChild({
          id: editingChild.id,
          name: fullName,
          username: username.trim(),
          password: password || undefined,
          birthdate,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        setLoading(false);
        toast.success("Child updated successfully ✨");
        navigate("/dashboard");
      } else {
        await createChild({
          name: fullName,
          username: username.trim(),
          password,
          birthdate,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        setLoading(false);
        setSuccessOpen(true);
      }
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
    toast.success("Child added successfully 🎉");
    navigate("/dashboard");
  };

  const headerTitle = isEditMode ? "Edit Child Information ✏️" : "Add a New Child 🧸";
  const headerSub = isEditMode
    ? "Update your child's profile details below"
    : "Create a safe learning profile for your child";
  const submitLabel = isEditMode ? "Update Child Info" : "Add Child";
  const loadingLabel = isEditMode ? "Updating profile..." : "Creating profile...";

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
            <div className="text-center mb-6">
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shadow-button mx-auto mb-4 bg-gradient-to-br",
                  isEditMode ? "from-secondary to-primary-glow" : "from-primary to-primary-glow",
                )}
              >
                {isEditMode ? (
                  <Pencil className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
                ) : (
                  <Sparkles className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{headerTitle}</h1>
              <p className="text-muted-foreground text-sm">{headerSub}</p>
            </div>

            {/* Editing indicator */}
            {isEditMode && editingChild && (
              <div className="flex items-center justify-between gap-3 mb-5 px-4 py-3 rounded-2xl bg-secondary/15 border border-secondary/30 animate-fade-slide-up">
                <div className="flex items-center gap-2 min-w-0">
                  <Pencil className="w-4 h-4 text-secondary-foreground shrink-0" />
                  <p className="text-sm font-semibold text-foreground truncate">
                    Editing:{" "}
                    <span className="text-primary">
                      {editingChild.firstName ?? editingChild.name}{" "}
                      {editingChild.lastName ?? ""}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive bg-card px-3 py-1.5 rounded-full border border-border/60 hover:border-destructive/40 transition-all shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* First & Last name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="child-first" className="text-sm font-semibold">
                    First Name
                  </Label>
                  <Input
                    id="child-first"
                    type="text"
                    placeholder="e.g. Emma"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (touched.firstName) setErrors(validate());
                    }}
                    onBlur={() => markTouched("firstName")}
                    aria-invalid={!!showError("firstName")}
                    className={cn(
                      showError("firstName") &&
                        "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                    )}
                  />
                  {showError("firstName") && (
                    <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                      {showError("firstName")}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="child-last" className="text-sm font-semibold">
                    Last Name
                  </Label>
                  <Input
                    id="child-last"
                    type="text"
                    placeholder="e.g. Parker"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (touched.lastName) setErrors(validate());
                    }}
                    onBlur={() => markTouched("lastName")}
                    aria-invalid={!!showError("lastName")}
                    className={cn(
                      showError("lastName") &&
                        "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                    )}
                  />
                  {showError("lastName") && (
                    <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                      {showError("lastName")}
                    </p>
                  )}
                </div>
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <Label htmlFor="child-age" className="text-sm font-semibold">
                  Age <span className="text-muted-foreground font-normal">(3 – 15)</span>
                </Label>
                <Input
                  id="child-age"
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={15}
                  placeholder="e.g. 7"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (touched.age) setErrors(validate());
                  }}
                  onBlur={() => markTouched("age")}
                  aria-invalid={!!showError("age")}
                  className={cn(
                    showError("age") &&
                      "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_4px_hsl(var(--destructive)/0.15)]",
                  )}
                />
                {showError("age") && (
                  <p className="text-xs text-destructive font-medium pl-1 animate-fade-slide-up">
                    {showError("age")}
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
                  Password{" "}
                  {isEditMode && (
                    <span className="text-muted-foreground font-normal">
                      (leave blank to keep current)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="child-password"
                    type={showPwd ? "text" : "password"}
                    placeholder={isEditMode ? "New password (optional)" : "At least 6 characters"}
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

              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="sm:flex-1"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className={cn(isEditMode ? "sm:flex-1" : "w-full")}
                  disabled={!isValid || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {loadingLabel}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {submitLabel}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            🛡️ Profiles are private and protected by your parent account.
          </p>
        </main>
      </div>

      {/* Success Modal (Add mode only) */}
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
