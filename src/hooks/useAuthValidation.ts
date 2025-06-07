
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser } from '@/types/auth';
import { clearSessionData, fetchUserProfile } from '@/utils/authUtils';

export const useAuthValidation = () => {
  const [loading, setLoading] = useState(true);

  const validateSessionAndUser = async (
    setSession: (session: Session | null) => void,
    setUser: (user: AuthUser | null) => void
  ) => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      console.log('🔍 Starting session validation with timeout protection...');
      setLoading(true);
      
      // Set up timeout protection - auto-logout after 3 seconds if stuck
      timeoutId = setTimeout(() => {
        console.warn('⏰ Session validation timeout - auto-logout triggered');
        toast.error('Session expired. Please log in again.');
        clearSessionData();
        setSession(null);
        setUser(null);
        setLoading(false);
      }, 3000);
      
      // Clear any potentially corrupted localStorage data first
      try {
        const authKey = `sb-${supabase.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
        const authData = localStorage.getItem(authKey);
        if (authData) {
          const parsed = JSON.parse(authData);
          if (!parsed || !parsed.access_token || !parsed.user) {
            console.log('🧹 Clearing corrupted localStorage auth data');
            localStorage.removeItem(authKey);
          }
        }
      } catch (e) {
        console.log('🧹 Clearing corrupted localStorage due to parse error');
        Object.keys(localStorage)
          .filter(key => key.startsWith('sb-'))
          .forEach(key => localStorage.removeItem(key));
      }
      
      // Get session with proper error handling
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      // Clear timeout since we got a response
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      if (sessionError) {
        console.error('❌ Session validation error:', sessionError);
        await clearSessionData();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!currentSession || !currentSession.user) {
        console.log('🔍 No valid session found - user needs to login');
        setSession(null);
        setUser(null);
        setLoading(false);
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
          role: currentSession.user.email === 'ahmedhanyseifeldien@gmail.com' ? 'ADMIN' : 'USER'
        };
        console.log('⚠️ Using fallback user data:', basicUserData);
        setUser(basicUserData);
      }
      
    } catch (error) {
      console.error('💥 Critical auth validation exception:', error);
      // Clear timeout if still active
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      await clearSessionData();
      setSession(null);
      setUser(null);
      toast.error('Authentication failed. Please try logging in again.');
    } finally {
      // CRITICAL: Always set loading to false
      setLoading(false);
      console.log('🔧 Auth validation completed, loading set to false');
    }
  };

  return { validateSessionAndUser, loading, setLoading };
};
