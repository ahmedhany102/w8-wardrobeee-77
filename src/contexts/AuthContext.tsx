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

  // We only pull the logic functions, not the state, to avoid circular dependencies
  const { login, adminLogin, signup, logout } = useAuthOperations();

  const loadUserProfile = async (userId: string, userEmail: string | undefined) => {
    try {
      // 1. Check ban status first
      const { data: canAuth, error: authCheckError } = await supabase.rpc(
        'can_user_authenticate',
        { _user_id: userId }
      );

      if (authCheckError) console.error('❌ Auth check error:', authCheckError);

      if (canAuth === false) { // Explicit check for false
        console.warn('🚫 BLOCKED: banned user detected');
        await supabase.auth.signOut();
        return null;
      }

      // 2. Fetch profile
      // Ensure we have a string for email, even if it's empty
      const safeEmail = userEmail || "";
      const userData = await fetchUserProfile(userId, safeEmail);
      return userData;

    } catch (error) {
      console.error('❌ Failed to load profile:', error);
      
      // SAFE Fallback that won't crash
      const safeEmail = userEmail || "";
      const safeName = safeEmail.includes('@') ? safeEmail.split('@')[0] : 'User';
      
      return {
        id: userId,
        email: safeEmail,
        name: safeName,
        role: 'USER'
      } as AuthUser;
    }
  };

  const checkAuthStatus = async () => {
    // Manually refresh auth state
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      const userData = await loadUserProfile(currentSession.user.id, currentSession.user.email);
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
    let mounted = true;
    console.log('🚀 Initializing auth system...');

    async function initializeAuth() {
      try {
        // 1. Get the session ONCE
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mounted && initialSession?.user) {
          console.log('🔍 Found existing session, loading profile...');
          const userData = await loadUserProfile(initialSession.user.id, initialSession.user.email);
          
          // If loadUserProfile returned null (banned), we don't set user
          if (mounted && userData) {
            setSession(initialSession);
            setUser(userData);
          }
        }
      } catch (err) {
        console.error("💥 Critical Auth Initialization Error:", err);
      } finally {
        // 2. ALWAYS finish loading, no matter what
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // 3. Listen for changes (Login, Logout, Auto-Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        console.log('🔔 Auth Event:', event);

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setLoading(false); // Ensure loader is off on logout
        } 
        else if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
          setSession(newSession);
          // Only fetch profile if we don't have it or it's a new user
          // Note: You can optimize this to not fetch on every refresh if needed
          const userData = await loadUserProfile(newSession.user.id, newSession.user.email);
          if (mounted && userData) {
             setUser(userData);
          }
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
