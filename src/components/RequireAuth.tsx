
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface RequireAuthProps {
  adminOnly?: boolean;
  children?: JSX.Element;
}

export const RequireAuth = ({ adminOnly = false, children }: RequireAuthProps) => {
  const { user, loading, isAdmin, session } = useAuth();
  const location = useLocation();
  const [hasShownError, setHasShownError] = useState(false);

  console.log('RequireAuth - Current State:', {
    user: user?.email || 'No user',
    session: !!session,
    loading,
    isAdmin,
    adminOnly,
    location: location.pathname
  });

  // Reset error state when location changes
  useEffect(() => {
    setHasShownError(false);
  }, [location.pathname]);

  // If we're still loading, show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!user || !session) {
    if (!hasShownError) {
      toast.error("Please login to access this page");
      setHasShownError(true);
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access
  if (adminOnly && !isAdmin) {
    if (!hasShownError) {
      toast.error("You don't have permission to access this page");
      setHasShownError(true);
    }
    return <Navigate to="/" replace />;
  }

  // Authentication successful
  return children ? children : <Outlet />;
};
