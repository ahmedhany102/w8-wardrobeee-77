
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
          // Force redirect to login on sign out
          if (window.location.pathname !== '/login' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/product/')) {
            window.location.href = '/login';
          }
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
