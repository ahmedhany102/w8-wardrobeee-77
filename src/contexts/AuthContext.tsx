
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

  // Force session refresh with timeout protection
  const forceSessionRefresh = async () => {
    try {
      console.log('🔄 Force refreshing session...');
      setLoading(true);
      
      const refreshPromise = supabase.auth.refreshSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session refresh timeout')), 3000)
      );
      
      const { data, error } = await Promise.race([refreshPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('❌ Session refresh failed:', error);
        await clearSessionData();
        setSession(null);
        setUser(null);
        toast.error('Session expired. Please login again.');
      } else if (data.session) {
        console.log('✅ Session refreshed successfully');
        setSession(data.session);
        // Update user profile if needed
        if (data.session.user) {
          try {
            const userData = await fetchUserProfile(data.session.user.id, data.session.user.email!);
            setUser(userData);
          } catch (profileError) {
            console.warn('Profile update failed after refresh:', profileError);
          }
        }
      }
    } catch (error) {
      console.error('💥 Force refresh exception:', error);
      await clearSessionData();
      setSession(null);
      setUser(null);
      toast.error('Session refresh failed. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Setting up enhanced auth system...');
    
    // Validate session and user on startup
    validateSessionAndUser(setSession, setUser);

    // Set up auth state change listener with improved error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setSession(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log('🔐 User signed in or token refreshed, fetching profile...');
            setSession(session);
            
            try {
              const userData = await fetchUserProfile(session.user.id, session.user.email!);
              setUser(userData);
              console.log('✅ Profile loaded after auth change:', userData);
            } catch (error) {
              console.error('❌ Failed to load profile after auth change:', error);
              // Don't fail completely, use basic user data
              const basicUserData: AuthUser = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.email?.split('@')[0] || 'User',
                role: session.user.email === 'ahmedhanyseifeldien@gmail.com' ? 'ADMIN' : 'USER'
              };
              setUser(basicUserData);
              toast.warning('Profile loading delayed - some features may be limited');
            } finally {
              setLoading(false);
            }
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log('🔑 Password recovery initiated');
          setLoading(false);
        }
      }
    );

    // Set up periodic session check to prevent stuck loading
    const sessionCheckInterval = setInterval(() => {
      if (loading) {
        console.log('⚠️ Detected stuck loading state, forcing refresh...');
        forceSessionRefresh();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
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
