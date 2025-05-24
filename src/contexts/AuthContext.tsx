
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

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (profile) {
        const authUser: AuthUser = {
          id: profile.id,
          email: profile.email || '',
          name: profile.name,
          displayName: profile.name,
          role: profile.is_admin ? 'ADMIN' : 'USER'
        };
        console.log('Setting user from profile:', authUser);
        setUser(authUser);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Initial session check
    checkAuthStatus();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before logging in.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message);
        }
        return false;
      }

      if (data.user && data.session) {
        console.log('Login successful for user:', data.user.id);
        toast.success('Login successful!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting admin login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Admin login error:', error);
        if (error.message.includes('Email not confirmed')) {
          toast.error('Admin account not confirmed. Please check email or contact system administrator.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid admin credentials. Please check email and password.');
        } else {
          toast.error(error.message);
        }
        return false;
      }

      if (data.user && data.session) {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin, is_super_admin')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error checking admin status:', profileError);
          await supabase.auth.signOut();
          toast.error('Error verifying admin status. Please try again.');
          return false;
        }

        if (profile?.is_admin || profile?.is_super_admin) {
          console.log('Admin login successful for user:', data.user.id);
          toast.success('Admin login successful!');
          return true;
        } else {
          // Sign out non-admin user
          await supabase.auth.signOut();
          toast.error('Access denied. Admin privileges required.');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Admin login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting signup for:', email, name);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        console.log('Signup successful for user:', data.user.id);
        if (data.user.email_confirmed_at) {
          toast.success('Account created successfully! You can now login.');
        } else {
          toast.success('Account created! Please check your email to confirm your account before logging in.');
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Error logging out');
      } else {
        setUser(null);
        setSession(null);
        toast.success('Logged out successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    adminLogin,
    signup,
    logout,
    loading,
    isAdmin: user?.role === 'ADMIN',
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
