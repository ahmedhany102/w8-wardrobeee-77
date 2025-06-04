
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { clearSessionData } from '@/utils/authUtils';

export const useAuthOperations = () => {
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error);
        toast.error(error.message || 'Login failed');
        return false;
      }

      if (data.session && data.user) {
        console.log('✅ Login successful');
        toast.success('Login successful!');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('💥 Login exception:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('👑 Admin login attempt for:', email);
    
    if (email !== 'ahmedhanyseifeldien@gmail.com') {
      toast.error('Invalid admin credentials');
      return false;
    }

    return await login(email, password);
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
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
        toast.error(error.message || 'Signup failed');
        return false;
      }

      if (data.user) {
        toast.success('Account created successfully!');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('💥 Signup exception:', error);
      toast.error('Signup failed');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out...');
      
      await clearSessionData();
      
      console.log('✅ Logout completed');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.warn('⚠️ Logout exception:', error);
      await clearSessionData();
      toast.success('Logged out successfully');
    }
  };

  return { login, adminLogin, signup, logout };
};
