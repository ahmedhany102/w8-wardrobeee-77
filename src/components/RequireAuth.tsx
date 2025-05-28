
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
  const [forceNavigation, setForceNavigation] = useState(false);

  console.log('RequireAuth - Current State:', {
    user: user?.email || 'No user',
    session: !!session,
    loading,
    isAdmin,
    adminOnly,
    location: location.pathname,
    forceNavigation
  });

  // Force navigation after 8 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout reached, forcing navigation');
        setForceNavigation(true);
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Clear force navigation when loading state changes
  useEffect(() => {
    if (!loading) {
      setForceNavigation(false);
    }
  }, [loading]);

  // Show loading state only for a reasonable time
  if (loading && !forceNavigation) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If forced navigation or not loading, check authentication
  if (!user || !session) {
    console.log('No user or session, redirecting to login');
    toast.error("Please login to access this page");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access
  if (adminOnly && !isAdmin) {
    console.log('Admin required but user is not admin');
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" replace />;
  }

  // Authentication successful
  console.log('Authentication successful, rendering content');
  return children ? children : <Outlet />;
};
