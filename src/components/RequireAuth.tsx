
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RequireAuthProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

export const RequireAuth = ({ children, adminOnly = false }: RequireAuthProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    // Loading state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    toast.error("Please login to access this page");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to home if admin access is required but user is not admin
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" replace />;
  }

  return children;
};
