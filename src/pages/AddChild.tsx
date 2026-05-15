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
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createChild, getChildById, updateChild } from "@/lib/children";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import PlayfulBackground from "@/components/PlayfulBackground";
import AppNavbar from "@/components/AppNavbar";
import { toast } from "sonner";
import { Child } from "@/lib/children";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/http";

interface Errors {
  firstName?: string;
  lastName?: string;
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
  const location = useLocation();
  const editingChild = location.state as Child | null;
  const isEditMode = !!editingChild;
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id?: string }>();
  const { accessToken } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<keyof Errors, boolean>>({
    firstName: false,
    lastName: false,
    birthDate: false,
    username: false,
    password: false,
    repeatPassword: false,
  });

  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};

    if (!firstName.trim()) e.firstName = "First name required";

    if (!lastName.trim()) e.lastName = "Last name required";


  if (!birthDate) {
  e.birthDate = "Birth date required";
} else {
  const today = new Date();
  const birth = new Date(birthDate);

  let age =
    today.getFullYear() - birth.getFullYear();

  const monthDiff =
    today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  if (age < 2 || age > 17) {
    e.birthDate =
      "Age must be between 2 and 17";
  }
}
    if (!username.trim()) e.username = "Username required";

    if (!isEditMode) {
      if (!password) e.password = "Password required";
      else if (password.length < 6) e.password = "Min 6 characters";

      if (password !== repeatPassword)
        e.repeatPassword = "Passwords don't match";
    }

    return e;
  };

  const liveErrors = validate();
  const isValid = Object.keys(liveErrors).length === 0;

  const markTouched = (key: keyof Errors) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const v = validate();
    setErrors(v);

    if (Object.keys(v).length > 0) return;

    setLoading(true);
    setSubmitError("");

    try {
      if (isEditMode && editingChild) {
        const payload = {
        id: editingChild.id,
        firstName,
        lastName,
        username,
        birthDate,
      };
        await updateChild(payload);
       console.log(">>>>>>>>>>>>>>>>",birthDate)
        toast.success("Updated");
        navigate("/dashboard");
      } else {
        console.log("STEP 3 CALLING CREATE CHILD");
        console.log("CALLING API WITH TOKEN:", accessToken);
        await createChild({
           firstName,
            lastName,
            username,
            password,
            birthDate,
        });


        toast.success("Child created successfully");
        navigate("/dashboard");
      }
    } catch (err) {
      const error = err as ApiError;

      if (error.status === 409) {
        setSubmitError("Username already exists");
      } else if (error.status === 401) {
        setSubmitError("Please login again");
      } else if (error.status === 404) {
        setSubmitError("Child not found");
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate("/dashboard");
  };

  useEffect(() => {
    if (!editingChild) return;

    setFirstName(editingChild.firstName || "");
    setLastName(editingChild.lastName || "");
  

    setUsername(editingChild.username || "");
    setBirthDate(
      editingChild.birthDate.split("T")[0]
    );
    setPassword("");
    setRepeatPassword("");

  }, [editingChild]);
  useEffect(() => {
    if (editId && !editingChild) {
      setLoading(true);
      getChildById(editId)
        .then((res) => {
          const child = res.data;
          setFirstName(child.firstName || "");
          setLastName(child.lastName || "");
          
          // setBirthDate(
          //   editingChild.birthDate.split("T")[0]
          // );
            setBirthDate(child.birthDate.split("T")[0]);
          setUsername(child.username || "");
        })
        .catch(() => navigate("/dashboard"))
        .finally(() => setLoading(false));
    }
  }, [editId, editingChild, navigate]);
  useEffect(() => {
    if (isEditMode) return;

    setFirstName("");
    setLastName("");
    setBirthDate("");
    setUsername("");
    setPassword("");
    setRepeatPassword("");
  }, [isEditMode, editId]);
  return (
    <div className="min-h-screen relative">
      <PlayfulBackground />
      <AppNavbar />

      <main className="max-w-2xl mx-auto p-6">
        <Link to="/dashboard" className="flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>First Name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => markTouched("firstName")}
            />
            {touched.firstName && errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label>Last Name</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => markTouched("lastName")}
            />
            {touched.lastName && errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName}</p>
            )}
          </div>

          <div>
            <Label>Birth Date</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              onBlur={() => markTouched("birthDate")}
            />
            {touched.birthDate && errors.birthDate && (
              <p className="text-red-500 text-sm">{errors.birthDate}</p>
            )}
          </div>

          <div>
            <Label>Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => markTouched("username")}
            />
            {touched.username && errors.username && (
              <p className="text-red-500 text-sm">{errors.username}</p>
            )}
          </div>

          {!isEditMode && (
            <>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-2 top-2"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div>
                <Label>Repeat Password</Label>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    onBlur={() => markTouched("repeatPassword")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-2 top-2"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {touched.repeatPassword && errors.repeatPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.repeatPassword}
                  </p>
                )}
              </div>
            </>
          )}

          {submitError && <p className="text-red-500">{submitError}</p>}

          <Button
            disabled={
              loading ||
              !firstName.trim() ||
              !lastName.trim() ||
              !birthDate ||
              !username.trim() ||
              (!isEditMode && (!password || !repeatPassword))
            }
          >
            {loading
              ? "Saving..."
              : isEditMode
                ? "Update Child"
                : "Create Child"}
          </Button>
        </form>
      </main>

      <Dialog
        open={successOpen}
        onOpenChange={(open) => {
          if (!open) handleSuccessClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success 🎉</DialogTitle>
            <DialogDescription>Child created successfully</DialogDescription>
          </DialogHeader>
          <Button onClick={handleSuccessClose}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddChild;
