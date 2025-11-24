import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser, AuthContextType } from '@/types/auth';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { fetchUserProfile } from '@/utils/authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const { login, adminLogin, signup, logout } = useAuthOperations();

  // Helper function to load user profile and check ban status
  const loadUserProfile = async (userId: string, userEmail: string) => {
    try {
      // Check if user is banned
      const { data: canAuth, error: authCheckError } = await supabase.rpc(
        'can_user_authenticate',
        { _user_id: userId }
      );

      if (authCheckError) {
        console.error('❌ Auth check error:', authCheckError);
      }

      if (!canAuth) {
        console.warn('🚫 BLOCKED: banned user detected');
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        toast.error('تم حظر حسابك. تم تسجيل الخروج تلقائياً');
        return null;
      }

      // Fetch user profile
      const userData = await fetchUserProfile(userId, userEmail);
      console.log('✅ User profile loaded:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Failed to load profile:', error);
      
      // Fallback user data
      const fallbackUser: AuthUser = {
        id: userId,
        email: userEmail,
        name: userEmail.split('@')[0] || 'User',
        role: 'USER'
      };
      
      return fallbackUser;
    }
  };

  const checkAuthStatus = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (currentSession?.user) {
      const userData = await loadUserProfile(currentSession.user.id, currentSession.user.email!);
      if (userData) {
        setSession(currentSession);
        setUser(userData);
      }
    } else {
      setSession(null);
      setUser(null);
    }
  };

  useEffect(() => {
    console.log('🚀 Initializing auth system...');

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log('🔍 Initial session check:', initialSession?.user?.email || 'No session');
      
      if (initialSession?.user) {
        setSession(initialSession);
        const userData = await loadUserProfile(initialSession.user.id, initialSession.user.email!);
        if (userData) {
          setUser(userData);
        }
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔔 Auth state changed:', event, newSession?.user?.email || 'No user');

        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setSession(null);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            console.log('🔐 Processing user session...');
            setSession(newSession);
            
            const userData = await loadUserProfile(newSession.user.id, newSession.user.email!);
            if (userData) {
              setUser(userData);
            }
          }
        }

        if (event === 'USER_UPDATED') {
          if (newSession?.user) {
            const userData = await loadUserProfile(newSession.user.id, newSession.user.email!);
            if (userData) {
              setUser(userData);
            }
          }
        }
      }
    );

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
