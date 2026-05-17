import { useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import PlayfulBackground from "@/components/PlayfulBackground";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { username, firstName } = useAuth();

  const [form, setForm] = useState({
    firstName: firstName || "",
    lastName: "",
    email: "",
    username: username || "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      console.log("UPDATE DATA:", form);

      // هون لاحقاً تربطي API
      toast.success("Profile updated successfully ✅");
    } catch {
      toast.error("Update failed ❌");
    }
  };

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
              <Label>Last Name</Label>
              <Input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
              />
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
              <Label>New Password</Label>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

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