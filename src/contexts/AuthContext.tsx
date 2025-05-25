
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

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUser(null);
        setSession(null);
        return;
      }

      setSession(session);
      
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email || session.user.email || '',
            name: profile.name,
            role: profile.is_admin ? 'ADMIN' : 'USER',
            displayName: profile.name || session.user.email
          });
        } else {
          // If no profile exists, create one
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email,
              role: 'USER',
              is_admin: false
            }]);

          if (!insertError) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
              role: 'USER',
              displayName: session.user.user_metadata?.name || session.user.email
            });
          }
        }
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to prevent infinite recursion
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            
            if (profile) {
              setUser({
                id: profile.id,
                email: profile.email || session.user.email || '',
                name: profile.name,
                role: profile.is_admin ? 'ADMIN' : 'USER',
                displayName: profile.name || session.user.email
              });
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Initial session check
    checkAuthStatus();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message || 'Failed to create account');
        return false;
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email to confirm your account.');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      return false;
    } finally {
      setLoading(false);
    }
  };

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
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please confirm your email address before logging in.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message || 'Failed to log in');
        }
        return false;
      }

      if (data.user && data.session) {
        console.log('Login successful for:', email);
        toast.success('Logged in successfully!');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting admin login for:', email);
      
      // First check if this is the admin email
      if (email !== 'ahmedhanyseifeldien@gmail.com') {
        toast.error('Invalid admin credentials');
        return false;
      }

      // For admin login, we need to handle both auth user creation and profile setup
      let authResult;
      
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('Admin user does not exist in auth, creating...');
        
        // Create the auth user for admin
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: 'Ahmed Hany' }
          }
        });

        if (signUpError) {
          console.error('Admin signup error:', signUpError);
          toast.error('Failed to create admin account');
          return false;
        }

        // Now try to sign in again
        const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (retryError) {
          console.error('Admin retry login error:', retryError);
          toast.error('Admin login failed');
          return false;
        }

        authResult = retrySignIn;
      } else if (signInError) {
        console.error('Admin login error:', signInError);
        toast.error(signInError.message || 'Admin login failed');
        return false;
      } else {
        authResult = signInData;
      }

      if (authResult?.user) {
        // Ensure admin profile exists and is properly configured
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authResult.user.id)
          .maybeSingle();

        if (!profile) {
          // Create admin profile
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert([{
              id: authResult.user.id,
              email: email,
              name: 'Ahmed Hany',
              is_admin: true,
              is_super_admin: true,
              role: 'ADMIN',
              status: 'ACTIVE'
            }]);

          if (createProfileError) {
            console.error('Error creating admin profile:', createProfileError);
          }
        } else if (!profile.is_admin) {
          // Update existing profile to admin
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              is_admin: true,
              is_super_admin: true,
              role: 'ADMIN',
              status: 'ACTIVE'
            })
            .eq('id', authResult.user.id);

          if (updateError) {
            console.error('Error updating admin profile:', updateError);
          }
        }

        console.log('Admin login successful');
        toast.success('Admin login successful!');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.message || 'Failed to log in as admin');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to log out');
    }
  };

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
