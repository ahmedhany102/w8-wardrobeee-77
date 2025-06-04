
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
      
      // Check if we have a session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session check error:', sessionError);
        await clearSessionData();
        setLoading(false);
        return;
      }

      if (!currentSession) {
        console.log('🔍 No session found');
        await clearSessionData();
        setLoading(false);
        return;
      }

      console.log('✅ Session found, fetching user data with timeout...');
      setSession(currentSession);

      // CRITICAL FIX: Fetch user with retry and timeout
      const userPromise = fetchUserWithRetry();
      const timeoutPromise = new Promise<null>(resolve => 
        setTimeout(() => {
          console.log('⏰ User fetch timeout reached (1000ms)');
          resolve(null);
        }, 1000)
      );

      const user = await Promise.race([userPromise, timeoutPromise]);

      if (!user) {
        console.log('🚨 User data not received within timeout or failed - clearing session');
        await clearSessionData();
        toast.error('Session expired or invalid. Please login again.');
        setLoading(false);
        return;
      }

      console.log('✅ Valid user found:', user.email);
      
      // Fetch and set user profile
      try {
        const userData = await fetchUserProfile(user.id, user.email!);
        setUser(userData);
        console.log('✅ User profile loaded successfully:', userData);
      } catch (profileError) {
        console.error('❌ Failed to load user profile:', profileError);
        await clearSessionData();
        toast.error('Failed to load user profile. Please login again.');
      }
      
    } catch (error) {
      console.error('💥 Auth validation exception:', error);
      await clearSessionData();
      toast.error('Authentication error. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  return { validateSessionAndUser, loading, setLoading };
};
