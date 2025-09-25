import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useAdminSessionMonitor = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const lastActivityRef = useRef<number>(Date.now());
  const activityTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Only monitor admin sessions
    if (!user || user.role !== 'ADMIN') return;

    console.log('🔐 Starting admin session monitoring');

    // Track user activity
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check session validity periodically
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          console.log('📤 Admin session expired or invalid');
          toast.error('انتهت صلاحية الجلسة الإدارية، يرجى تسجيل الدخول مرة أخرى');
          navigate('/admin-login');
          return;
        }

        // Check if token is about to expire (within 5 minutes)
        const expiresAt = currentSession.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry < 300) { // 5 minutes
          console.log('🔄 Token expires soon, refreshing...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('❌ Failed to refresh admin session:', refreshError);
            toast.error('فشل في تحديث الجلسة، يرجى تسجيل الدخول مرة أخرى');
            navigate('/admin-login');
          } else {
            console.log('✅ Admin session refreshed successfully');
          }
        }
      } catch (error) {
        console.error('💥 Session check failed:', error);
        // Don't force logout on network errors, just warn
        console.warn('⚠️ Network error during session check, will retry');
      }
    };

    // Check session every 2 minutes
    const sessionInterval = setInterval(checkSession, 2 * 60 * 1000);

    // Initial session check
    checkSession();

    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(sessionInterval);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [user, session, navigate]);
};