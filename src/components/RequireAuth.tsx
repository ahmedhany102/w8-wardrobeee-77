
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface RequireAuthProps {
  adminOnly?: boolean;
  children?: JSX.Element;
}

export const RequireAuth = ({ adminOnly = false, children }: RequireAuthProps) => {
  const { user, loading, isAdmin, checkAuthStatus } = useAuth();
  const location = useLocation();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [securityTokenValid, setSecurityTokenValid] = useState(true);
  
  // Auto logout after inactivity (30 minutes)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  // Check security token every 5 minutes
  const SECURITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Function to validate security token
  const validateSecurityToken = () => {
    // In a real application, this would verify the JWT or session token with the backend
    // For this demo, we'll check if the user exists in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      setSecurityTokenValid(false);
      return false;
    }
    
    try {
      // Check if token format is valid
      JSON.parse(storedUser);
      setSecurityTokenValid(true);
      return true;
    } catch (e) {
      // Invalid JSON format in token
      setSecurityTokenValid(false);
      return false;
    }
  };

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
        
        // Clear local session data
        localStorage.removeItem('currentUser');
      }
    }, 60000); // Check every minute
    
    // Validate security token periodically
    const securityCheck = setInterval(() => {
      if (!validateSecurityToken()) {
        toast.error("Session expired. Please log in again.");
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
      }
    }, SECURITY_CHECK_INTERVAL);
    
    // Initial security token validation
    validateSecurityToken();
    
    return () => {
      // Clean up event listeners and timers
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityCheck);
      clearInterval(securityCheck);
    };
  }, [lastActivity]);

  // Additional security checks for admin pages
  useEffect(() => {
    if (adminOnly && user) {
      // Simple token rotation/refresh for admin sessions
      const adminTokenRefresh = setInterval(() => {
        // In a real app, this would refresh the admin JWT token
        // For this demo, we'll just check admin status again
        checkAuthStatus();
      }, 10 * 60 * 1000); // Refresh every 10 minutes
      
      // Verify admin status periodically (every minute)
      const adminCheck = setInterval(() => {
        if (!isAdmin) {
          setIsAuthenticated(false);
          toast.error("Admin session expired or invalid");
        }
      }, 60000);
      
      return () => {
        clearInterval(adminCheck);
        clearInterval(adminTokenRefresh);
      };
    }
  }, [adminOnly, user, isAdmin, checkAuthStatus]);

  // Additional layer of protection for admin pages
  useEffect(() => {
    if (adminOnly) {
      // Implementation of advanced security measures for admin
      // In a real app, this would implement additional verification
      
      // For demo: Implement a basic CSRF protection mock
      const csrfToken = `csrf-${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('csrfToken', csrfToken);
    }
  }, [adminOnly, location.pathname]);

  if (!isAuthenticated || !securityTokenValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

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

  // Return children or outlet based on what's provided
  return children ? children : <Outlet />;
};
