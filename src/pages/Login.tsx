import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PlayfulBackground from "@/components/PlayfulBackground";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { login as apiLogin } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { toast } from "sonner";
import User from "@/models/User";
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"parent" | "child" | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  const isValid =
    username.trim().length > 0 && password.length > 0 && userType !== null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!username.trim() || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    if (!userType) {
      setError("Please select Parent or Child");
      return;
    }

    
    try {
      const res = await apiLogin({
        username: username.trim(),
        password: password,
        selectedRole: userType,
      });

      console.log("LOGIN RESPONSE:", res);

      const token = res.data.accessToken;
      const user = res.data.user;
      console.log("USER DATA:", res.data.user);
      localStorage.setItem("accessToken", token);

      
      localStorage.setItem("userType", user.type);
      localStorage.setItem("USER_KEY", JSON.stringify(user));

    if (user.gender) {
    localStorage.setItem(
      "gender",
      user.gender
    );
  }

    if (user.readingLevel) {
      console.log("reading level:" , user.readingLevel)
    localStorage.setItem(
      "readingLevel",
      user.readingLevel
    );
  }

  if (user.responseLength) {
    localStorage.setItem(
      "responseLength",
      user.responseLength
    );
  }

  if (user.learningStyle) {
    localStorage.setItem(
      "learningStyle",
      user.learningStyle
    );
  }

  if (user.interests) {
    localStorage.setItem(
      "interests",
      JSON.stringify(user.interests)
    );
  }
  if (user.blockedTopics) {
    localStorage.setItem(
      "blockedTopics",
      JSON.stringify(user.blockedTopics)
    );
  }
      login(token, user.type, user.username, user, user.firstName);

      navigate(user.type === "parent" ? "/dashboard" : "/chat");
    } catch (err) {
     
      if (err instanceof ApiError) {
          toast.error(err.message)
        } else {
          toast.error("Unexpected error 💥")
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <PlayfulBackground />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md z-10">
        <div className={cn("bg-card p-8 rounded-2xl")}>
          <div className="flex items-center justify-center mb-4">
            <Sparkles />
            <h1 className="ml-2 font-bold">Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Login as</Label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("parent")}
                  className={cn(
                    "flex-1 py-2 rounded-xl border transition flex items-center justify-center gap-2",
                    userType === "parent"
                      ? "bg-primary text-white"
                      : "bg-transparent hover:bg-muted",
                  )}
                >
                  👨‍👩‍👧 Parent
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("child")}
                  className={cn(
                    "flex-1 py-2 rounded-xl border transition flex items-center justify-center gap-2",
                    userType === "child"
                      ? "bg-primary text-white"
                      : "bg-transparent hover:bg-muted",
                  )}
                >
                  🧒 Child
                </button>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-center text-sm">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : "Login"}
            </Button>
          </form>

          <p className="text-center mt-4 text-sm  text-muted-foreground ">
            <button onClick={() => setForgotOpen(true)}>
              Forgot password?
            </button>
          </p>

          <p className="text-center mt-2 text-sm text-primary font-semibold">
            <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  );
};

export default Login;
