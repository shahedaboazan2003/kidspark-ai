import { useEffect, useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import PlayfulBackground from "@/components/PlayfulBackground";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getTokenStats } from "@/lib/profile";
import { useTranslation } from "react-i18next";
const Profile = () => {
  const { t } = useTranslation();
  const { username, firstName } = useAuth();

  const [form, setForm] = useState({
    firstName: firstName || "",
    email: "",
    username: username || "",
  });

  const [data, setData] = useState(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      console.log("UPDATE DATA:", form);

      toast.success(t("profileUpdatedSuccess"));
    } catch {
      toast.error(t("updateFailed"));
    }
  };
  useEffect(() => {
    getTokenStats().then(setData);
  }, []);

return (
  <div className="min-h-screen bg-background relative">
    <div
      className="absolute inset-0 playful-bg opacity-60"
      aria-hidden="true"
    />
    <PlayfulBackground />
    <div className="relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <main className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-6">{t("myProfile")} 👤</h1>

          <div className="bg-card p-6 rounded-2xl space-y-4 shadow">
            <div>
              <Label>{t("firstName")}</Label>
              <Input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>{t("email")}</Label>
              <Input name="email" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <Label>{t("username")}</Label>
              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>{t("tokenBalance")}</Label>
              <Input value={data?.data.tokenBalance || ""} readOnly />
            </div>

            <div>
              <Label>{t("usedTokens")}</Label>
              <Input value={data?.data.usedTokens || ""} readOnly />
            </div>

            {/* <div>
              <Label>{t("totalTokens")}</Label>
              <Input value={data?.data.summary.totalTokens || ""} readOnly />
            </div> */}

            <Button onClick={handleSave} className="w-full">
              {t("saveChanges")}
            </Button>
          </div>
        </main>
      </div>
    </div>
          </div>

  );
};

export default Profile;
