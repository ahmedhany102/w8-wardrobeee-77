
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
    // Clear localStorage/sessionStorage tokens
    localStorage.removeItem('sb-auth-token');
    sessionStorage.removeItem('sb-auth-token');
    localStorage.removeItem('sb-user');
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
      // Store session tokens for persistence
      console.log('💾 Storing session tokens');
      localStorage.setItem('sb-auth-token', userSession.access_token);
      sessionStorage.setItem('sb-auth-token', userSession.access_token);
      localStorage.setItem('sb-user', JSON.stringify(authUser));
      
      // Set session immediately
      setSession(userSession);
      
      // Fetch user profile from database
      console.log('📋 Fetching user profile from database');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Profile fetch error:', error);
        toast.error('Failed to load user profile');
        clearAuthState();
        setLoading(false);
        return;
      }

      // Create profile if doesn't exist
      if (!profile) {
        console.log('👤 Creating new profile for user:', authUser.email);
        const isAdmin = authUser.email === 'ahmedhanyseifeldien@gmail.com';
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            role: isAdmin ? 'ADMIN' : 'USER',
            is_admin: isAdmin,
            is_super_admin: isAdmin,
            status: 'ACTIVE'
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Failed to create profile:', insertError);
          toast.error('Failed to create user profile');
          clearAuthState();
          setLoading(false);
          return;
        }
        
        const userData: AuthUser = {
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.is_admin ? 'ADMIN' : 'USER',
          displayName: newProfile.name
        };
        
        console.log('✅ New profile created and user set:', userData.email);
        setUser(userData);
      } else {
        const userData: AuthUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.is_admin ? 'ADMIN' : 'USER',
          displayName: profile.name
        };
        
        console.log('✅ Existing profile loaded and user set:', userData.email);
        setUser(userData);
      }
    } catch (error) {
      console.error('💥 Error processing user session:', error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Setting up auth system...');
    
    // Check for existing tokens first
    const checkStoredTokens = async () => {
      const storedToken = localStorage.getItem('sb-auth-token') || sessionStorage.getItem('sb-auth-token');
      
      if (storedToken) {
        console.log('🔑 Found stored token, checking validity');
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Session validation error:', error);
            clearAuthState();
            setLoading(false);
            return;
          }
          
          if (session) {
            console.log('✅ Valid session found from stored token');
            await processUserSession(session.user, session);
          } else {
            console.log('❌ No valid session despite stored token');
            clearAuthState();
            setLoading(false);
          }
        } catch (error) {
          console.error('💥 Token validation failed:', error);
          clearAuthState();
          setLoading(false);
        }
      } else {
        console.log('🔍 No stored tokens found');
        setLoading(false);
      }
    };

    checkStoredTokens();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (event === 'SIGNED_OUT') {
          clearAuthState();
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await processUserSession(session?.user || null, session);
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
        return false;
      }

      if (data.session && data.user) {
        console.log('✅ Login successful, storing tokens');
        
        // Store tokens immediately
        localStorage.setItem('sb-auth-token', data.session.access_token);
        sessionStorage.setItem('sb-auth-token', data.session.access_token);
        localStorage.setItem('sb-user', JSON.stringify(data.user));
        
        toast.success('تم تسجيل الدخول بنجاح!');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('💥 Login exception:', error);
      toast.error('فشل تسجيل الدخول');
      return false;
    } finally {
      setLoading(false);
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
        return false;
      }

      if (data.user) {
        toast.success('تم إنشاء الحساب بنجاح!');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('💥 Signup exception:', error);
      toast.error('فشل إنشاء الحساب');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear local state and storage first
      clearAuthState();
      
      // Then attempt Supabase logout
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
        return;
      }
      
      await processUserSession(session?.user || null, session);
    } catch (error) {
      console.error('💥 Auth status check exception:', error);
      clearAuthState();
    }
  };

  console.log('🏪 Auth Context Current State:', {
    user: user?.email || 'No user',
    session: !!session,
    loading,
    isAdmin: user?.role === 'ADMIN'
  });

  return (
    <AuthContext.Provider value={{
      user,
      session,
      login,
      adminLogin,
      signup,
      logout,
      loading,
      isAdmin: user?.role === 'ADMIN',
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
