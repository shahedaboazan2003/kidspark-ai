import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Child, AVATAR_PRESETS } from "@/lib/children";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: Child | null;
  onSave: (child: Child) => void;
}

interface Errors {
  name?: string;
  username?: string;
  birthdate?: string;
}

const EditChildModal = ({ open, onOpenChange, child, onSave }: Props) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && child) {
      setName(child.name);
      setUsername(child.username);
      setBirthdate(child.birthdate);
      const idx = AVATAR_PRESETS.findIndex((p) => p.emoji === child.avatarEmoji);
      setAvatarIdx(idx >= 0 ? idx : 0);
      setErrors({});
    }
  }, [open, child]);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Name is required 🌟";
    if (!username.trim()) e.username = "Username is required ✨";
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim()))
      e.username = "3-30 letters, numbers or _ only 🙏";
    if (!birthdate) e.birthdate = "Please add a birthdate 🎂";
    else if (new Date(birthdate) > new Date()) e.birthdate = "Birthdate can't be in the future 🙂";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!child) return;
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    onSave({
      ...child,
      name: name.trim(),
      username: username.trim(),
      birthdate,
      avatarEmoji: AVATAR_PRESETS[avatarIdx].emoji,
      avatarColor: AVATAR_PRESETS[avatarIdx].color,
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-border/50 shadow-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Child</DialogTitle>
          <DialogDescription>Update your child's details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
          {/* Avatar picker */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Avatar</Label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarIdx(i)}
                  className={cn(
                    "aspect-square rounded-xl text-xl flex items-center justify-center bg-gradient-to-br transition-all",
                    preset.color,
                    avatarIdx === i
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-105"
                      : "hover:scale-105 opacity-70 hover:opacity-100",
                  )}
                  aria-label={`Avatar ${preset.emoji}`}
                >
                  {preset.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-sm font-semibold">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && <p className="text-xs text-destructive font-medium pl-1">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-username" className="text-sm font-semibold">Username</Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(errors.username && "border-destructive")}
            />
            {errors.username && <p className="text-xs text-destructive font-medium pl-1">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-birthdate" className="text-sm font-semibold">Birthdate</Label>
            <Input
              id="edit-birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={cn(errors.birthdate && "border-destructive")}
            />
            {errors.birthdate && <p className="text-xs text-destructive font-medium pl-1">{errors.birthdate}</p>}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChildModal;
