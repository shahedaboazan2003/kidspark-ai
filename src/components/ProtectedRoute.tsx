import { ReactNode, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, UserType } from "@/contexts/AuthContext";
import LoadingScreen from "./LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles allowed to access this route. Omit to allow any authenticated user. */
  allow?: UserType[];
}

const homeFor = (type: UserType) => (type === "parent" ? "/dashboard" : "/chat");

const ProtectedRoute = ({ children, allow }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, userType } = useAuth();
  const location = useLocation();
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !warnedRef.current) {
      warnedRef.current = true;
      toast("Please login to continue 💛", {
        description: "Your session was not found.",
      });
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated || !userType) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && !allow.includes(userType)) {
    return <Navigate to={homeFor(userType)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
