import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayfulBackground from "@/components/PlayfulBackground";
import OtpInput from "@/components/OtpInput";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { verifyEmail } from "@/lib/auth";

const RESEND_SECONDS = 30;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email =
    (location.state as { email?: string } | null)?.email ?? "your inbox";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  useEffect(() => {
    if (otp.length === 6 && !loading) {
      void handleVerify(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleVerify = async (code: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await verifyEmail({
        email: email.trim().toLowerCase(),
        otp: code.trim(),
      });

      login(
        res.data.accessToken,
        res.data.user.type,
        res.data.user.username,
      );
      toast.success("Email verified! 🎉", {
        description: "Welcome to Little Minds — let's get you set up.",
      });
      setTimeout(() => navigate("/dashboard"), 400);
    } catch (e) {
      const reason = (e as Error).message;
      const msg =
        reason === "EXPIRED_CODE"
          ? "This code has expired. Please request a new one ⏰"
          : reason === "NO_PENDING_REGISTRATION"
            ? "No pending sign-up found. Please register again 📝"
            : "That code doesn't look right. Try again 😕";
      setError(msg);
      setShake((k) => k + 1);
      setOtp("");
      setLoading(false);
    }
  };

  const handleResend = () => {
    setResendIn(RESEND_SECONDS);
    setOtp("");
    setError("");
    toast.success("New code sent! 💌", {
      description: `Check ${email} for your fresh code.`,
    });
  };

  return (
    <div className="min-h-screen playful-bg flex items-center justify-center px-4 py-12 relative">
      <PlayfulBackground />
      <div className="w-full max-w-md relative z-10 animate-fade-slide-up">
        <div
          key={shake}
          className={cn(
            "bg-card rounded-3xl shadow-card p-8 sm:p-10 text-center border border-border/50",
            shake > 0 && "animate-shake",
          )}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button mx-auto mb-6">
            <Mail
              className="w-10 h-10 text-primary-foreground"
              strokeWidth={2.2}
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Check your email 💌
          </h1>
          <p className="text-muted-foreground text-sm mb-7">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-foreground break-all">
              {email}
            </span>
          </p>

          <OtpInput
            value={otp}
            onChange={setOtp}
            hasError={!!error}
            disabled={loading}
          />

          {error && (
            <p className="text-sm text-destructive font-medium mt-4 animate-fade-slide-up">
              {error}
            </p>
          )}

          <Button
            variant="hero"
            size="lg"
            className="w-full mt-6"
            onClick={() => handleVerify(otp)}
            disabled={otp.length !== 6 || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="mt-5 text-sm text-muted-foreground">
            Didn't get a code?{" "}
            {resendIn > 0 ? (
              <span className="text-muted-foreground/70">
                Resend in {resendIn}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary font-semibold hover:underline underline-offset-4 inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resend code
              </button>
            )}
          </div>

          <Link
            to="/register"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mt-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Register
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          🛡️ Tip for demo: any 6 digits work. Try{" "}
          <code className="font-mono">000000</code> for invalid,{" "}
          <code className="font-mono">111111</code> for expired.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
