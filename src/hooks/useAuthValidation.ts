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
    console.log('🔍 Starting session validation...');

    try {
      setLoading(true);

      // ✅ Get current session directly from Supabase
      const { data: { session: currentSession }, error } =
        await supabase.auth.getSession();

      if (error) {
        console.error('❌ Session validation error:', error);
        await secureLogout();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // ✅ If there is a session, do NOT override what onAuthStateChange already set
      if (currentSession?.user) {
        console.log('✅ Validation found a valid session. Not overwriting context.');
        setLoading(false);
        return;
      }

      // ❌ No session at all → user logged out
      console.log('🔍 No valid session found during validation');
      setSession(null);
      setUser(null);
      setLoading(false);
      return;

    } catch (e) {
      console.error('💥 Critical validation exception:', e);
      await secureLogout();
      setSession(null);
      setUser(null);
    } finally {
      console.log('🔧 Validation end: loading=false');
      setLoading(false);
    }
  };

  return { validateSessionAndUser, loading, setLoading };
};
