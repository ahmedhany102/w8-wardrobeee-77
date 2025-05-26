
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

  const processUserSession = async (authUser: User | null, userSession: Session | null) => {
    console.log('Processing user session:', authUser?.email || 'No user');
    
    if (!authUser || !userSession) {
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
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
            console.error('Failed to create profile:', insertError);
            setUser(null);
            setSession(null);
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
          
          setUser(userData);
          setSession(userSession);
        } else {
          setUser(null);
          setSession(null);
        }
      } else {
        const userData: AuthUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.is_admin ? 'ADMIN' : 'USER',
          displayName: profile.name
        };
        
        setUser(userData);
        setSession(userSession);
      }
    } catch (error) {
      console.error('Error processing user session:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'No session');
      processUserSession(session?.user || null, session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        processUserSession(session?.user || null, session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Login failed');
        return false;
      }

      if (data.user && data.session) {
        console.log('Login successful');
        toast.success('Login successful!');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('Admin login attempt for:', email);
    
    if (email !== 'ahmedhanyseifeldien@gmail.com') {
      toast.error('Invalid admin credentials');
      return false;
    }

    return await login(email, password);
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message || 'Signup failed');
        return false;
      }

      if (data.user) {
        toast.success('Account created successfully!');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Signup failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    processUserSession(session?.user || null, session);
  };

  console.log('Auth Context Current State:', {
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
