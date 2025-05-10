
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface RequireAuthProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

export const RequireAuth = ({ children, adminOnly = false }: RequireAuthProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  // Auto logout after inactivity (30 minutes)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    // Set up activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity);
    });
    
    // Check for inactivity periodically (every minute)
    const inactivityCheck = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        // Log out due to inactivity
        setIsAuthenticated(false);
        toast.error("You've been logged out due to inactivity");
      }
    }, 60000); // Check every minute
    
    return () => {
      // Clean up event listeners and timer
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityCheck);
    };
  }, [lastActivity]);

  // Additional security checks for admin pages
  useEffect(() => {
    if (adminOnly && user) {
      // Verify admin status periodically (every minute)
      const adminCheck = setInterval(() => {
        if (!isAdmin) {
          setIsAuthenticated(false);
          toast.error("Admin session expired or invalid");
        }
      }, 60000);
      
      return () => clearInterval(adminCheck);
    }
  }, [adminOnly, user, isAdmin]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    // Loading state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
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
