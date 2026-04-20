import { ReactNode, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "./LoadingScreen";

/** Wrap public auth pages (/login, /register) — bounces signed-in users to their home. */
const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, userType } = useAuth();
  const notedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !notedRef.current) {
      notedRef.current = true;
      toast("You're already signed in ✨");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated && userType) {
    return <Navigate to={userType === "parent" ? "/dashboard" : "/chat"} replace />;
  }
  return <>{children}</>;
};

export default PublicOnlyRoute;
