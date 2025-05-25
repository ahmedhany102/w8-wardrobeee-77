
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
      console.log('Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched:', profile);
      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const createUserProfile = async (userId: string, email: string, name?: string) => {
    try {
      console.log('Creating profile for:', email);
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: email,
          name: name || email.split('@')[0],
          is_admin: false,
          role: 'USER',
          status: 'ACTIVE'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      console.log('Profile created:', data);
      return data;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return null;
    }
  };

  const updateAuthUser = async (authUser: User) => {
    try {
      console.log('Updating auth user:', authUser.email);
      let profile = await fetchUserProfile(authUser.id);
      
      if (!profile) {
        console.log('Profile not found, creating new one');
        profile = await createUserProfile(
          authUser.id, 
          authUser.email || '', 
          authUser.user_metadata?.name
        );
      }

      if (profile) {
        const userData = {
          id: profile.id,
          email: profile.email || authUser.email || '',
          name: profile.name,
          role: profile.is_admin ? 'ADMIN' : 'USER',
          displayName: profile.name || authUser.email
        };
        
        console.log('Setting user data:', userData);
        setUser(userData);
      } else {
        console.error('Failed to get or create profile');
        setUser(null);
      }
    } catch (error) {
      console.error('Error updating auth user:', error);
      setUser(null);
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      setLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUser(null);
        setSession(null);
        return;
      }

      console.log('Current session:', session?.user?.email || 'No session');
      setSession(session);
      
      if (session?.user) {
        await updateAuthUser(session.user);
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
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        
        if (session?.user) {
          await updateAuthUser(session.user);
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
        toast.error(error.message || 'Failed to create account');
        return false;
      }

      if (data.user) {
        console.log('Signup successful for:', email);
        toast.success('Account created successfully! You can now log in.');
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
        setSession(data.session);
        await updateAuthUser(data.user);
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
      
      // Check if this is the admin email
      if (email !== 'ahmedhanyseifeldien@gmail.com') {
        toast.error('Invalid admin credentials');
        return false;
      }

      // First, try to sign in with existing credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Admin login error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          // User doesn't exist in auth, create admin account
          console.log('Admin user does not exist, creating...');
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name: 'Ahmed Hany' }
            }
          });

          if (signUpError) {
            console.error('Admin signup error:', signUpError);
            toast.error('Failed to create admin account: ' + signUpError.message);
            return false;
          }

          if (signUpData.user) {
            // Create admin profile manually
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: signUpData.user.id,
                email: email,
                name: 'Ahmed Hany',
                is_admin: true,
                is_super_admin: true,
                role: 'ADMIN',
                status: 'ACTIVE'
              });

            if (profileError) {
              console.error('Error creating admin profile:', profileError);
            }

            // Now try to sign in
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email,
              password
            });

            if (loginError) {
              console.error('Admin login after creation failed:', loginError);
              toast.error('Admin login failed after account creation');
              return false;
            }

            if (loginData.user && loginData.session) {
              setSession(loginData.session);
              await updateAuthUser(loginData.user);
              toast.success('Admin account created and logged in successfully!');
              return true;
            }
          }
        } else {
          toast.error(error.message || 'Admin login failed');
          return false;
        }
      } else if (data.user && data.session) {
        // Successful login - ensure user has admin privileges
        console.log('Admin login successful');
        setSession(data.session);
        
        // Update profile to ensure admin status
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            name: 'Ahmed Hany',
            is_admin: true,
            is_super_admin: true,
            role: 'ADMIN',
            status: 'ACTIVE'
          });

        if (updateError) {
          console.error('Error updating admin profile:', updateError);
        }

        await updateAuthUser(data.user);
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
      console.log('Logging out...');
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

  console.log('Auth Context State:', {
    user: user?.email || 'No user',
    session: session?.user?.email || 'No session',
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
