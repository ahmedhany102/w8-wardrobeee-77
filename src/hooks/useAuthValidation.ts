
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser } from '@/types/auth';
import { clearSessionData, fetchUserWithRetry, fetchUserProfile } from '@/utils/authUtils';

export const useAuthValidation = () => {
  const [loading, setLoading] = useState(true);

  const validateSessionAndUser = async (
    setSession: (session: Session | null) => void,
    setUser: (user: AuthUser | null) => void
  ) => {
    try {
      console.log('🔍 Validating session and user...');
      setLoading(true);
      
      // Check if we have a session with shorter timeout
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session check error:', sessionError);
        await clearSessionData();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!currentSession) {
        console.log('🔍 No session found - user needs to login');
        await clearSessionData();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('✅ Session found, fetching user data with reduced timeout...');
      setSession(currentSession);

      // FIXED: One-time timeout check, not continuous
      let timeoutTriggered = false;
      const sessionTimeout = setTimeout(() => {
        if (!timeoutTriggered) {
          timeoutTriggered = true;
          console.log('⏰ Session validation timeout - clearing auth state');
          supabase.auth.signOut().then(() => {
            setSession(null);
            setUser(null);
            setLoading(false);
            // Redirect to login if not already there
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
              window.location.href = '/login';
            }
          });
        }
      }, 1000);

      try {
        // CRITICAL FIX: Reduced timeout to 500ms and better error handling
        const userPromise = fetchUserWithRetry(1, 300); // 1 retry, 300ms delay
        const timeoutPromise = new Promise<null>(resolve => 
          setTimeout(() => {
            console.log('⏰ User fetch timeout reached (500ms) - clearing session');
            resolve(null);
          }, 500)
        );

        const user = await Promise.race([userPromise, timeoutPromise]);

        // Clear the session timeout if we got here successfully
        if (!timeoutTriggered) {
          clearTimeout(sessionTimeout);
        }

        if (!user && !timeoutTriggered) {
          console.log('🚨 User data timeout or failed - clearing session and redirecting');
          await clearSessionData();
          setSession(null);
          setUser(null);
          toast.error('Session expired. Please login again.');
          setLoading(false);
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
          return;
        }

        if (user && !timeoutTriggered) {
          console.log('✅ Valid user found:', user.email);
          
          // Fetch and set user profile with timeout protection
          try {
            const profilePromise = fetchUserProfile(user.id, user.email!);
            const profileTimeoutPromise = new Promise<null>((resolve) => 
              setTimeout(() => {
                console.log('⏰ Profile fetch timeout - proceeding with basic user data');
                resolve(null);
              }, 500)
            );

            const userData = await Promise.race([profilePromise, profileTimeoutPromise]);
            
            if (userData) {
              setUser(userData);
              console.log('✅ User profile loaded successfully:', userData);
            } else {
              // Fallback to basic user data if profile fetch times out
              const basicUserData: AuthUser = {
                id: user.id,
                email: user.email!,
                name: user.email?.split('@')[0] || 'User',
                role: user.email === 'ahmedhanyseifeldien@gmail.com' ? 'ADMIN' : 'USER'
              };
              setUser(basicUserData);
              console.log('⚠️ Using fallback user data due to profile timeout');
            }
          } catch (profileError) {
            console.error('❌ Failed to load user profile:', profileError);
            // Don't clear session, just use basic user data
            const basicUserData: AuthUser = {
              id: user.id,
              email: user.email!,
              name: user.email?.split('@')[0] || 'User',
              role: user.email === 'ahmedhanyseifeldien@gmail.com' ? 'ADMIN' : 'USER'
            };
            setUser(basicUserData);
            toast.warning('Profile loading delayed - some features may be limited');
          }
        }
      } catch (fetchError) {
        console.error('💥 User fetch exception:', fetchError);
        if (!timeoutTriggered) {
          clearTimeout(sessionTimeout);
          await clearSessionData();
          setSession(null);
          setUser(null);
          toast.error('Authentication error. Please login again.');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
        }
      } finally {
        if (!timeoutTriggered) {
          setLoading(false);
        }
      }
      
    } catch (error) {
      console.error('💥 Auth validation exception:', error);
      await clearSessionData();
      setSession(null);
      setUser(null);
      toast.error('Authentication error. Please login again.');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
      setLoading(false);
    }
  };

  return { validateSessionAndUser, loading, setLoading };
};
