
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
  const [authResolved, setAuthResolved] = useState(false);

  console.log('RequireAuth - Auth State:', {
    user: user?.email || 'No user',
    session: !!session,
    loading,
    isAdmin,
    adminOnly,
    location: location.pathname,
    authResolved
  });

  // Mark auth as resolved when loading completes
  useEffect(() => {
    if (!loading) {
      console.log('Auth loading completed, marking as resolved');
      setAuthResolved(true);
    }
  }, [loading]);

  // Show loading spinner while auth is being determined
  if (!authResolved) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user || !session) {
    console.log('User not authenticated, redirecting to login');
    toast.error("Please login to access this page");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin permissions
  if (adminOnly && !isAdmin) {
    console.log('Admin access required but user is not admin');
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" replace />;
  }

  // Authentication successful
  console.log('Authentication successful, rendering protected content');
  return children ? children : <Outlet />;
};
