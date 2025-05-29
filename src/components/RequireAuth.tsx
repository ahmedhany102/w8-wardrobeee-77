
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

interface RequireAuthProps {
  adminOnly?: boolean;
  children?: JSX.Element;
}

export const RequireAuth = ({ adminOnly = false, children }: RequireAuthProps) => {
  const { user, loading, isAdmin, session } = useAuth();
  const location = useLocation();

  console.log('🛡️ RequireAuth - Auth State:', {
    user: user?.email || 'No user',
    session: !!session,
    loading,
    isAdmin,
    adminOnly,
    location: location.pathname,
    userRole: user?.role || 'No role'
  });

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800 font-medium">جاري التحقق من المصادقة...</p>
          <p className="mt-2 text-sm text-gray-600">
            Session: {session ? '✅' : '❌'} | User: {user ? '✅' : '❌'}
          </p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user || !session) {
    console.log('❌ User not authenticated, redirecting to login');
    toast.error("يرجى تسجيل الدخول للوصول إلى هذه الصفحة");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin permissions
  if (adminOnly && !isAdmin) {
    console.log('⛔ Admin access required but user is not admin', {
      userRole: user.role,
      isAdmin,
      adminOnly
    });
    toast.error("ليس لديك صلاحية للوصول إلى هذه الصفحة");
    return <Navigate to="/" replace />;
  }

  // Authentication successful
  console.log('✅ Authentication successful, rendering protected content');
  return children ? children : <Outlet />;
};
