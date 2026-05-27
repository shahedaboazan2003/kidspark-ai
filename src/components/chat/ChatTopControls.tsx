// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { LogOut } from "lucide-react";
// import { toast } from "sonner";
// import ThemeToggle from "@/components/ThemeToggle";
// import LogoutConfirmModal from "@/components/dashboard/LogoutConfirmModal";
// import { useAuth } from "@/contexts/AuthContext";
// import { cn } from "@/lib/utils";

// interface ChatTopControlsProps {
//   className?: string;
// }

// /**
//  * Floating controls (theme toggle + logout) shown in the Chat page.
//  * Visible to both parents and children so they can switch theme and
//  * log out from inside the chat without needing the global navbar.
//  */
// const ChatTopControls = ({ className }: ChatTopControlsProps) => {
//   const navigate = useNavigate();
//   const { logout, firstName, username } = useAuth();
//   const [open, setOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     toast.success(`See you soon${firstName ? `, ${firstName}` : username ? `, ${username}` : ""}! 👋`);
//     navigate("/login", { replace: true });
//   };

//   return (
//     <>
//       <div
//         className={cn(
//           "flex items-center gap-1.5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-card px-1.5 py-1.5",
//           className,
//         )}
//       >
//         <ThemeToggle className="w-9 h-9" />
//         <button
//           type="button"
//           onClick={() => setOpen(true)}
//           className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-semibold text-destructive bg-destructive/10 hover:bg-destructive/15 hover:scale-105 active:scale-95 transition-all"
//           aria-label="Logout"
//         >
//           <LogOut className="w-4 h-4" />
//           <span className="hidden sm:inline">Logout</span>
//         </button>
//       </div>

//       <LogoutConfirmModal open={open} onOpenChange={setOpen} onConfirm={handleLogout} />
//     </>
//   );
// };

// export default ChatTopControls;
const ChatTopControls = () => {
  return null;
};

export default ChatTopControls;