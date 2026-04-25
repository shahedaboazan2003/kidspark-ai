import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, MessageCircleQuestion, Clock, UserPlus, BookOpen, UsersRound, AlertCircle, PlusCircle } from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import StatCard from "@/components/dashboard/StatCard";
import ChildCard from "@/components/dashboard/ChildCard";
import ChildCardSkeleton from "@/components/dashboard/ChildCardSkeleton";
import QuickActionCard from "@/components/dashboard/QuickActionCard";

import DeleteChildModal from "@/components/dashboard/DeleteChildModal";
import PlayfulBackground from "@/components/PlayfulBackground";
import { Button } from "@/components/ui/button";
import { Child, loadChildren, saveChildren } from "@/lib/children";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type LoadState = "loading" | "ready" | "error";

const Dashboard = () => {
  const { firstName, username } = useAuth();
  const greetingName =
    firstName ||
    (username ? username.charAt(0).toUpperCase() + username.slice(1) : "there");
  const [state, setState] = useState<LoadState>("loading");
  const [children, setChildren] = useState<Child[]>([]);
  const [editing, setEditing] = useState<Child | null>(null);
  const [deleting, setDeleting] = useState<Child | null>(null);

  // Simulate GET /children
  useEffect(() => {
    let cancelled = false;
    setState("loading");
    const t = setTimeout(() => {
      if (cancelled) return;
      try {
        setChildren(loadChildren());
        setState("ready");
      } catch {
        setState("error");
      }
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  const handleSave = (updated: Child) => {
    const next = children.map((c) => (c.id === updated.id ? updated : c));
    setChildren(next);
    saveChildren(next);
    toast.success(`${updated.name}'s profile updated ✨`);
  };

  const handleDelete = (child: Child) => {
    const next = children.filter((c) => c.id !== child.id);
    setChildren(next);
    saveChildren(next);
    toast.success(`${child.name} has been removed`);
  };

  const stats = {
    totalChildren: children.length,
    questionsToday: 47,
    activeMinutes: 82,
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 playful-bg opacity-60" aria-hidden />
      <PlayfulBackground />

      <div className="relative z-10">
        <AppNavbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Greeting */}
          <div className="mb-8 animate-fade-slide-up">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Welcome back, {greetingName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your little learners today.
            </p>
          </div>

          {/* Stats */}
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
              label="Questions Asked Today"
              value={stats.questionsToday}
              icon={MessageCircleQuestion}
              emoji="❓"
              gradient="from-secondary to-primary-glow"
              delay={100}
            />
            <StatCard
              label="Active Usage Time"
              value={stats.activeMinutes}
              suffix="min"
              icon={Clock}
              emoji="⏱"
              gradient="from-accent to-secondary"
              delay={200}
            />
          </section>

          {/* Children section */}
          <section className="mb-10">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Children 🧸</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage profiles and keep their journey safe.
                </p>
              </div>
              {state === "ready" && children.length > 0 && (
                <Link to="/add-child" className="hidden sm:block">
                  <Button variant="hero" size="default">
                    <PlusCircle className="w-4 h-4" />
                    Add Child
                  </Button>
                </Link>
              )}
            </div>

            {state === "loading" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <ChildCardSkeleton key={i} delay={i * 80} />
                ))}
              </div>
            )}

            {state === "error" && (
              <div className="bg-card rounded-2xl p-10 text-center border border-destructive/30 shadow-soft animate-scale-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="font-bold text-lg">Oops! Something went wrong 💫</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  We couldn't load your children right now.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </div>
            )}

            {state === "ready" && children.length === 0 && (
              <div className="bg-card rounded-3xl p-10 sm:p-14 text-center border border-border/50 shadow-soft animate-scale-fade-in">
                <div className="text-6xl mb-3">🧸</div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Your journey starts here
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Add your first child to begin learning together!
                </p>
                <Link to="/add-child">
                  <Button variant="hero" size="lg">
                    <PlusCircle className="w-5 h-5" />
                    Add Your First Child
                  </Button>
                </Link>
              </div>
            )}

            {state === "ready" && children.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child, i) => (
                  <ChildCard
                    key={child.id}
                    child={child}
                    onEdit={() => setEditing(child)}
                    onDelete={() => setDeleting(child)}
                    delay={i * 80}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-5">Quick Actions ⚡</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <QuickActionCard
                to="/add-child"
                label="Add Child"
                description="Create a new profile"
                icon={UserPlus}
                gradient="from-primary to-primary-glow"
                delay={0}
              />
              <QuickActionCard
                to="/history"
                label="View History"
                description="Browse past conversations"
                icon={BookOpen}
                gradient="from-secondary to-primary-glow"
                delay={100}
              />
              <QuickActionCard
                to="/accounts"
                label="View Accounts"
                description="Manage all profiles"
                icon={UsersRound}
                gradient="from-accent to-secondary"
                delay={200}
              />
            </div>
          </section>
        </main>
      </div>

      <EditChildModal
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        child={editing}
        onSave={handleSave}
      />
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
