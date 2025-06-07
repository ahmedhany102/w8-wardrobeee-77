
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
    try {
      console.log('🔍 Validating session and user...');
      setLoading(true);
      
      // Simple session check without complex timeouts
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
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('✅ Session found, fetching user data...');
      setSession(currentSession);

      try {
        // Simplified user profile fetch without complex timeouts
        const userData = await fetchUserProfile(currentSession.user.id, currentSession.user.email!);
        setUser(userData);
        console.log('✅ User profile loaded successfully:', userData);
      } catch (profileError) {
        console.error('❌ Failed to load user profile:', profileError);
        // Use basic user data as fallback
        const basicUserData: AuthUser = {
          id: currentSession.user.id,
          email: currentSession.user.email!,
          name: currentSession.user.email?.split('@')[0] || 'User',
          role: currentSession.user.email === 'ahmedhanyseifeldien@gmail.com' ? 'ADMIN' : 'USER'
        };
        setUser(basicUserData);
        console.log('⚠️ Using fallback user data');
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('💥 Auth validation exception:', error);
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  };

  return { validateSessionAndUser, loading, setLoading };
};
