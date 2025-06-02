
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'USER';
  displayName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  checkAuthStatus: () => Promise<void>;
}

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
  const [loading, setLoading] = useState(true);

  const clearAuthState = async () => {
    console.log('🧹 Clearing auth state and signing out');
    setUser(null);
    setSession(null);
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
  };

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      console.log('📋 Fetching user profile for:', userId, userEmail);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Profile fetch error:', error);
        throw error;
      }

      if (!profile) {
        console.log('👤 Creating new profile for user:', userEmail);
        const isAdmin = userEmail === 'ahmedhanyseifeldien@gmail.com';
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            name: userEmail?.split('@')[0] || 'User',
            role: isAdmin ? 'ADMIN' : 'USER',
            is_admin: isAdmin,
            is_super_admin: isAdmin,
            status: 'ACTIVE'
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Failed to create profile:', insertError);
          throw insertError;
        }
        
        return {
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.is_admin ? 'ADMIN' : 'USER',
          displayName: newProfile.name
        };
      } else {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.is_admin ? 'ADMIN' : 'USER',
          displayName: profile.name
        };
      }
    } catch (error) {
      console.error('💥 Error in fetchUserProfile:', error);
      throw error;
    }
  };

  const validateSessionAndUser = async () => {
    try {
      console.log('🔍 Validating session and user...');
      
      // First check if we have a session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session check error:', sessionError);
        await clearAuthState();
        setLoading(false);
        return;
      }

      if (!currentSession) {
        console.log('🔍 No session found');
        await clearAuthState();
        setLoading(false);
        return;
      }

      // Now validate the user from that session
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        console.error('❌ User validation failed:', userError?.message || 'No user found');
        console.log('🚨 Session exists but user is invalid - clearing session');
        await clearAuthState();
        setLoading(false);
        return;
      }

      console.log('✅ Valid session and user found:', currentUser.email);
      
      // Set session first
      setSession(currentSession);
      
      // Fetch and set user profile
      try {
        const userData = await fetchUserProfile(currentUser.id, currentUser.email!);
        setUser(userData);
        console.log('✅ User profile loaded successfully:', userData);
      } catch (profileError) {
        console.error('❌ Failed to load user profile:', profileError);
        await clearAuthState();
      }
      
    } catch (error) {
      console.error('💥 Auth validation exception:', error);
      await clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Setting up auth system...');
    
    // Validate session and user on startup
    validateSessionAndUser();

    // Set up auth state change listener
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
            console.log('🔐 User signed in, fetching profile...');
            setSession(session);
            try {
              const userData = await fetchUserProfile(session.user.id, session.user.email!);
              setUser(userData);
              console.log('✅ Profile loaded after sign in:', userData);
            } catch (error) {
              console.error('❌ Failed to load profile after sign in:', error);
              await clearAuthState();
            } finally {
              setLoading(false);
            }
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error);
        toast.error(error.message || 'تعذر تسجيل الدخول');
        setLoading(false);
        return false;
      }

      if (data.session && data.user) {
        console.log('✅ Login successful');
        toast.success('تم تسجيل الدخول بنجاح!');
        // Auth state change listener will handle the rest
        return true;
      }

      setLoading(false);
      return false;
    } catch (error: any) {
      console.error('💥 Login exception:', error);
      toast.error('فشل تسجيل الدخول');
      setLoading(false);
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('👑 Admin login attempt for:', email);
    
    if (email !== 'ahmedhanyseifeldien@gmail.com') {
      toast.error('بيانات المدير غير صحيحة');
      return false;
    }

    return await login(email, password);
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('📝 Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        toast.error(error.message || 'فشل إنشاء الحساب');
        setLoading(false);
        return false;
      }

      if (data.user) {
        toast.success('تم إنشاء الحساب بنجاح!');
        setLoading(false);
        return true;
      }

      setLoading(false);
      return false;
    } catch (error: any) {
      console.error('💥 Signup exception:', error);
      toast.error('فشل إنشاء الحساب');
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out...');
      setLoading(true);
      
      await clearAuthState();
      
      console.log('✅ Logout completed');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error: any) {
      console.warn('⚠️ Logout exception:', error);
      await clearAuthState();
      toast.success('تم تسجيل الخروج بنجاح');
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    await validateSessionAndUser();
  };

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

  console.log('🏪 Auth Context Current State:', {
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
