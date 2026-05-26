import { useEffect, useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import PlayfulBackground from "@/components/PlayfulBackground";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getTokenStats } from "@/lib/profile";

const Profile = () => {
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

      toast.success("Profile updated successfully ✅");
    } catch {
      toast.error("Update failed ❌");
    }
  };
  useEffect(() => {
    getTokenStats().then(setData);
  }, []);
  /*  if (!data) return <div>Loading....</div>; */
  if (!data || !data.data) {
    return <div>Loading or API error...</div>;
  }
  return (
    <div className="min-h-screen bg-background relative">
      <PlayfulBackground />

      <div className="relative z-10">
        <AppNavbar />
        <main className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-6">My Profile 👤</h1>

          <div className="bg-card p-6 rounded-2xl space-y-4 shadow">
            <div>
              <Label>First Name</Label>
              <Input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input name="email" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <Label>Username</Label>
              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Token Balance</Label>
              <Input value={data?.data.tokenBalance || ""} readOnly />
            </div>

            <div>
              <Label>Used Tokens</Label>
              <Input value={data?.data.usedTokens || ""} readOnly />
            </div>

            {/* <div>
              <Label>Total Tokens</Label>
              <Input value={data?.data.summary.totalTokens || ""} readOnly />
            </div> */}

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
