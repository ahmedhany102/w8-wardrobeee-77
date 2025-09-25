
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser, AuthContextType } from '@/types/auth';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { fetchUserProfile, clearSessionData } from '@/utils/authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  const { validateSessionAndUser, loading, setLoading } = useAuthValidation();
  const { login, adminLogin, signup, logout } = useAuthOperations();

  const checkAuthStatus = async () => {
    await validateSessionAndUser(setSession, setUser);
  };

  useEffect(() => {
    console.log('🚀 Initializing auth system with timeout protection...');
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out - clearing state');
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log('🔐 User signed in or token refreshed - processing...');
            setSession(session);
            
            try {
              const userData = await fetchUserProfile(session.user.id, session.user.email!);
              setUser(userData);
              console.log('✅ Profile loaded after auth change:', userData);
            } catch (error) {
              console.error('❌ Failed to load profile after auth change:', error);
              // Fallback user data
              const basicUserData: AuthUser = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.email?.split('@')[0] || 'User',
                role: session.user.email === 'ahmedhanyseifeldien@gmail.com' ? 'ADMIN' : 'USER'
              };
              setUser(basicUserData);
            }
            setLoading(false);
          }
        }
      }
    );

    // THEN validate initial session with timeout protection
    const initializeAuth = async () => {
      try {
        await validateSessionAndUser(setSession, setUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up periodic session refresh for admin users to prevent idle timeouts
    let refreshInterval: NodeJS.Timeout;
    
    const setupSessionRefresh = () => {
      clearInterval(refreshInterval);
      
      if (session?.user) {
        console.log('🔄 Setting up session refresh for user:', session.user.email);
        
        // Refresh session every 30 minutes for active users
        refreshInterval = setInterval(async () => {
          try {
            console.log('🔄 Attempting periodic session refresh...');
            const { data, error } = await supabase.auth.refreshSession();
            
            if (error) {
              console.error('❌ Session refresh failed:', error);
              // If refresh fails, try to get session again
              const { data: sessionData } = await supabase.auth.getSession();
              if (!sessionData.session) {
                console.log('📤 Session expired, user needs to re-login');
                setUser(null);
                setSession(null);
                toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
              }
            } else if (data.session) {
              console.log('✅ Session refreshed successfully');
              setSession(data.session);
            }
          } catch (error) {
            console.error('💥 Session refresh error:', error);
          }
        }, 30 * 60 * 1000); // 30 minutes
      }
    };

    // Set up refresh whenever session changes
    setupSessionRefresh();

    return () => {
      subscription.unsubscribe();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [session?.user?.id]); // Re-run when session user changes

  const contextValue = {
    user,
    session,
    login,
    adminLogin,
    signup,
    logout,
    loading,
    isAdmin: user?.role === 'ADMIN',
    checkAuthStatus
  };

  console.log('🏪 Auth Context State:', {
    user: user?.email || 'No user',
    session: !!session,
    loading,
    isAdmin: user?.role === 'ADMIN'
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
