import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  MessageCircleQuestion,
  Clock,
  UserPlus,
  BookOpen,
  UsersRound,
  AlertCircle,
  PlusCircle,
} from "lucide-react";

import AppNavbar from "@/components/AppNavbar";
import StatCard from "@/components/dashboard/StatCard";
import ChildCard from "@/components/dashboard/ChildCard";
import ChildCardSkeleton from "@/components/dashboard/ChildCardSkeleton";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import DeleteChildModal from "@/components/dashboard/DeleteChildModal";
import PlayfulBackground from "@/components/PlayfulBackground";
import { Button } from "@/components/ui/button";
import { Child } from "@/lib/children";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChildren,
  deleteChildById,
  createChild,
  updateChild,
} from "@/lib/children";
type LoadState = "loading" | "ready" | "error";

const Dashboard = () => {
  const { firstName, username, accessToken } = useAuth();
  const navigate = useNavigate();

  const greetingName =
    firstName ||
    (username ? username.charAt(0).toUpperCase() + username.slice(1) : "there");

  const [state, setState] = useState<LoadState>("loading");
  const [children, setChildren] = useState<Child[]>([]);

  const [deleting, setDeleting] = useState<Child | null>(null);

  // LOAD CHILDREN 
  useEffect(() => {
    const load = async () => {
      try {
        setState("loading");

        const res = await getChildren();
        setChildren(res.data || []);
        setState("ready");
      } catch (err) {
        console.log(err);
        setState("error");
      }
    };

    if (accessToken) {
      load();
    }

    window.addEventListener("focus", load);

    return () => window.removeEventListener("focus", load);
  }, [accessToken]);

  const handleDelete = async (child: Child) => {
    try {
      await deleteChildById(child.id);

      setChildren((prev) => prev.filter((c) => c.id !== child.id));

      toast.success(`${child.firstName} ${child.lastName} has been removed`);
    } catch {
      toast.error("Failed to delete child");
    }
  };

  const stats = {
    totalChildren: children.length,
    questionsToday: 47,
    activeMinutes: 82,
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 playful-bg opacity-60" />
      <PlayfulBackground />

      <div className="relative z-10">
        <AppNavbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Welcome back, {greetingName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your little learners today.
            </p>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <StatCard
              label="Total Children"
              value={stats.totalChildren}
              icon={Users}
              emoji="👶"
              gradient="from-primary to-primary-glow"
              delay={0}
            />
            <StatCard
              label="Questions Today"
              value={stats.questionsToday}
              icon={MessageCircleQuestion}
              emoji="❓"
              gradient="from-secondary to-primary-glow"
              delay={100}
            />
            <StatCard
              label="Active Time"
              value={stats.activeMinutes}
              suffix="min"
              icon={Clock}
              emoji="⏱"
              gradient="from-accent to-secondary"
              delay={200}
            />
          </section>

          <section>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-2xl font-bold">Your Children 🧸</h2>
                <p className="text-sm text-muted-foreground">
                  Manage profiles and keep them safe.
                </p>
              </div>

              <Link to="/add-child">
                <Button variant="hero">
                  <PlusCircle className="w-4 h-4" />
                  Add Child
                </Button>
              </Link>
            </div>

            {state === "loading" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <ChildCardSkeleton key={i} delay={i * 80} />
                ))}
              </div>
            )}

            {state === "error" && (
              <div className="text-center p-10 border border-red-200 rounded-2xl">
                <AlertCircle className="mx-auto text-red-500" />
                <p className="mt-2">Failed to load children</p>
              </div>
            )}

            {state === "ready" && children.length === 0 && (
              <div className="text-center p-10">
                <p>No children yet</p>
                <Link to="/add-child">
                  <Button className="mt-4">Add First Child</Button>
                </Link>
              </div>
            )}

            {state === "ready" && children.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child, i) => (
                  <ChildCard
                    key={child.id}
                    child={child}
                    onEdit={() =>
                      navigate(`/edit-child/${child.id}`, { state: child })
                    }
                    onDelete={() => setDeleting(child)}
                    delay={i * 80}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-5">Quick Actions ⚡</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <QuickActionCard
                to="/add-child"
                label="Add Child"
                description="Create profile"
                icon={UserPlus}
                gradient="from-primary to-primary-glow"
              />
              <QuickActionCard
                to="/history"
                label="History"
                description="View chats"
                icon={BookOpen}
                gradient="from-secondary to-primary-glow"
              />
              <QuickActionCard
                to="/accounts"
                label="Accounts"
                description="Manage users"
                icon={UsersRound}
                gradient="from-accent to-secondary"
              />
            </div>
          </section>
        </main>
      </div>

      <DeleteChildModal
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        child={deleting}
        onConfirm={() => deleting && handleDelete(deleting)}
      />
    </div>
  );
};

export default Dashboard;
