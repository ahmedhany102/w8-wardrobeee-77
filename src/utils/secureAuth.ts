
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createRateLimiter } from './sanitization';

// Rate limiters for different operations
const loginRateLimit = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const signupRateLimit = createRateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour

export const secureLogin = async (email: string, password: string): Promise<boolean> => {
  const identifier = `login_${email}`;
  
  if (!loginRateLimit(identifier)) {
    toast.error('Too many login attempts. Please try again later.');
    return false;
  }

  try {
    console.log('🔐 Attempting secure login for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'Login failed');
      return false;
    }

    if (data.session && data.user) {
      // CRITICAL: Check if user is banned IMMEDIATELY after login
      console.log('🔍 Checking ban status for user:', data.user.id);
      
      const { data: canAuth, error: authCheckError } = await supabase.rpc('can_user_authenticate', {
        _user_id: data.user.id
      });

      if (authCheckError) {
        console.error('❌ Auth check error:', authCheckError);
        await supabase.auth.signOut();
        toast.error('Authentication validation failed');
        return false;
      }

      if (!canAuth) {
        console.warn('🚫 BLOCKED: Banned user attempted login:', data.user.email);
        await supabase.auth.signOut();
        toast.error('تم حظر حسابك. يرجى الاتصال بالدعم');
        return false;
      }

      console.log('✅ Login successful - user is active');
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

export const secureSignup = async (email: string, password: string, name: string): Promise<boolean> => {
  const identifier = `signup_${email}`;
  
  if (!signupRateLimit(identifier)) {
    toast.error('Too many signup attempts. Please try again later.');
    return false;
  }

  try {
    console.log('📝 Attempting secure signup for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { name: name.trim() }
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

// Server-side admin check using secure user_roles table
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    // Prefer secure RPC to avoid any RLS edge cases
    const { data, error } = await supabase.rpc('is_admin', { _user_id: userId });

    if (error) {
      console.error('❌ Error checking admin status via RPC:', error);
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.error('💥 Exception checking admin status:', error);
    return false;
  }
};

export const secureLogout = async (): Promise<void> => {
  try {
    console.log('🚪 Secure logout...');
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    await supabase.auth.signOut();
    
    console.log('✅ Secure logout completed');
    toast.success('Logged out successfully');
  } catch (error: any) {
    console.warn('⚠️ Logout exception:', error);
    // Force clear even if signOut fails
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Logged out successfully');
  }
};
