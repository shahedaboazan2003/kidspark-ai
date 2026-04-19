import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

const QuickActionCard = ({ to, label, description, icon: Icon, gradient, delay = 0 }: Props) => (
  <Link
    to={to}
    className="group bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-card hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 flex items-center gap-4 animate-fade-slide-up opacity-0"
    style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
  >
    <div
      className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-button shrink-0 bg-gradient-to-br transition-transform group-hover:scale-110 group-hover:rotate-3",
        gradient,
      )}
    >
      <Icon className="w-7 h-7 text-primary-foreground" strokeWidth={2.2} />
    </div>
    <div className="min-w-0">
      <div className="font-bold text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
    </div>
  </Link>
);

export default QuickActionCard;
