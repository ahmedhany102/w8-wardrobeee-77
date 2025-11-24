
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser } from '@/types/auth';
import { secureLogout } from '@/utils/secureAuth';
import { fetchUserProfile } from '@/utils/authUtils';

export const useAuthValidation = () => {
  const [loading, setLoading] = useState(true);

  const validateSessionAndUser = async (
    setSession: (session: Session | null) => void,
    setUser: (user: AuthUser | null) => void
  ) => {
    let done = false;
    const end = () => { 
      if (!done) { 
        done = true; 
        setLoading(false); 
      } 
    };

    // Watchdog timeout to prevent infinite loading
    const watchdog = setTimeout(() => {
      console.warn('⏰ Auth validation watchdog released the loader after 8s');
      end();
    }, 8000);

    try {
      console.log('🔍 Starting session validation...');
      setLoading(true);
      
      // Get session directly without manual localStorage manipulation
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session validation error:', sessionError);
        await secureLogout();
        setSession(null);
        setUser(null);
        clearTimeout(watchdog);
        end();
        return;
      }

      if (!currentSession || !currentSession.user) {
        console.log('🔍 No valid session found - user needs to login');
        setSession(null);
        setUser(null);
        clearTimeout(watchdog);
        end();
        return;
      }

      // CRITICAL: Check if user is banned before proceeding
      console.log('🔍 Checking ban status during session validation...');
      const { data: canAuth, error: authCheckError } = await supabase.rpc('can_user_authenticate', {
        _user_id: currentSession.user.id
      });

      if (authCheckError) {
        console.error('❌ Auth check error:', authCheckError);
      }

      if (!canAuth) {
        console.warn('🚫 BLOCKED: Banned user session detected, signing out:', currentSession.user.email);
        await secureLogout();
        setSession(null);
        setUser(null);
        clearTimeout(watchdog);
        end();
        toast.error('تم حظر حسابك. تم تسجيل الخروج تلقائياً');
        return;
      }

      console.log('✅ Valid session found, setting session and fetching user profile...');
      setSession(currentSession);

      try {
        // Fetch user profile with proper error handling
        const userData = await fetchUserProfile(currentSession.user.id, currentSession.user.email!);
        console.log('✅ User profile loaded successfully:', userData);
        setUser(userData);
      } catch (profileError) {
        console.error('❌ Failed to load user profile:', profileError);
        // Create basic user data as fallback but ensure it's complete
        const basicUserData: AuthUser = {
          id: currentSession.user.id,
          email: currentSession.user.email!,
          name: currentSession.user.email?.split('@')[0] || 'User',
          role: 'USER' // Default to USER, admin check will happen server-side
        };
        console.log('⚠️ Using fallback user data:', basicUserData);
        setUser(basicUserData);
      }
      
    } catch (error) {
      console.error('💥 Critical auth validation exception:', error);
      await secureLogout();
      setSession(null);
      setUser(null);
      toast.error('Authentication failed. Please try logging in again.');
    } finally {
      // CRITICAL: Always set loading to false
      clearTimeout(watchdog);
      end();
      console.log('🔧 Auth validation completed, loading set to false');
    }
  };

  return { validateSessionAndUser, loading, setLoading };
};
