
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

  const clearAuthState = () => {
    console.log('🧹 Clearing auth state');
    setUser(null);
    setSession(null);
    localStorage.removeItem('sb-auth-token');
    sessionStorage.removeItem('sb-auth-token');
    localStorage.removeItem('sb-user');
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
        
        const userData: AuthUser = {
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.is_admin ? 'ADMIN' : 'USER',
          displayName: newProfile.name
        };
        
        console.log('✅ New profile created:', userData);
        return userData;
      } else {
        const userData: AuthUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.is_admin ? 'ADMIN' : 'USER',
          displayName: profile.name
        };
        
        console.log('✅ Existing profile loaded:', userData);
        return userData;
      }
    } catch (error) {
      console.error('💥 Error in fetchUserProfile:', error);
      throw error;
    }
  };

  const processUserSession = async (authUser: User | null, userSession: Session | null) => {
    console.log('🔄 Processing user session:', authUser?.email || 'No user');
    
    if (!authUser || !userSession) {
      console.log('❌ No valid user or session');
      clearAuthState();
      setLoading(false);
      return;
    }

    try {
      // Store session first
      setSession(userSession);
      
      // Save tokens to storage
      localStorage.setItem('sb-auth-token', userSession.access_token);
      sessionStorage.setItem('sb-auth-token', userSession.access_token);
      localStorage.setItem('sb-user', JSON.stringify(authUser));
      
      // Fetch and set user profile
      const userData = await fetchUserProfile(authUser.id, authUser.email!);
      setUser(userData);
      
    } catch (error) {
      console.error('💥 Error processing user session:', error);
      clearAuthState();
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Setting up auth system...');
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          if (mounted) {
            clearAuthState();
            setLoading(false);
          }
          return;
        }
        
        if (session && mounted) {
          console.log('✅ Found existing session:', session.user.email);
          await processUserSession(session.user, session);
        } else {
          console.log('🔍 No existing session found');
          if (mounted) {
            clearAuthState();
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (mounted) {
          clearAuthState();
          setLoading(false);
        }
      }
    };

    // Initialize auth first
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT') {
          clearAuthState();
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await processUserSession(session.user, session);
          }
        }
      }
    );

    return () => {
      mounted = false;
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
        // processUserSession will be called by onAuthStateChange
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
      
      // Clear local state first
      clearAuthState();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('⚠️ Logout error (but continuing):', error);
      }
      
      console.log('✅ Logout completed');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error: any) {
      console.warn('⚠️ Logout exception (but continuing):', error);
      clearAuthState();
      toast.success('تم تسجيل الخروج بنجاح');
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      console.log('🔍 Checking auth status...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Auth status check error:', error);
        clearAuthState();
        setLoading(false);
        return;
      }
      
      await processUserSession(session?.user || null, session);
    } catch (error) {
      console.error('💥 Auth status check exception:', error);
      clearAuthState();
      setLoading(false);
    }
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
