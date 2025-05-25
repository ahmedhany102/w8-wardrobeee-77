
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
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  // Auto logout after inactivity (30 minutes)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

  useEffect(() => {
    // Set up activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      setLastActivity(Date.now());
      setShowTimeoutWarning(false);
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity);
    });
    
    // Check for inactivity periodically (every minute)
    const inactivityCheck = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      
      if (timeSinceActivity > INACTIVITY_TIMEOUT) {
        // Log out due to inactivity
        toast.error("You've been logged out due to inactivity");
        window.location.href = "/login";
      } else if (timeSinceActivity > (INACTIVITY_TIMEOUT - WARNING_TIME) && !showTimeoutWarning) {
        setShowTimeoutWarning(true);
        toast.warning("You'll be logged out in 5 minutes due to inactivity");
      }
    }, 60000); // Check every minute
    
    return () => {
      // Clean up event listeners and timers
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityCheck);
    };
  }, [lastActivity, showTimeoutWarning]);

  console.log('RequireAuth - Auth State:', {
    user: user?.email || 'No user',
    session: session?.user?.email || 'No session',
    loading,
    isAdmin,
    adminOnly,
    location: location.pathname
  });

  if (loading) {
    // Loading state with improved animation
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 border-t-4 border-b-4 border-green-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-t-4 border-b-4 border-green-400 rounded-full animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }}></div>
            <div className="absolute inset-4 border-t-4 border-b-4 border-green-300 rounded-full animate-spin animation-delay-300"></div>
          </div>
          <p className="mt-4 text-green-800 dark:text-green-300 font-medium animate-pulse">Verifying your credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    // Redirect to login if not authenticated
    console.log('No user or session found, redirecting to login');
    toast.error("Please login to access this page");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to home if admin access is required but user is not admin
    console.log('Admin access required but user is not admin');
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" replace />;
  }

  // Return children or outlet based on what's provided
  return children ? children : <Outlet />;
};
