
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '@/types/auth';
import { secureLogout } from './secureAuth';

export const clearSessionData = secureLogout;

export const fetchUserWithRetry = async (retries = 2, delayMs = 500): Promise<User | null> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt} to fetch user data`);
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log(`❌ Attempt ${attempt} failed:`, error.message);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }
        return null;
      }
      
      if (user) {
        console.log(`✅ User data fetched successfully on attempt ${attempt}`);
        return user;
      }
    } catch (error) {
      console.error(`💥 Exception on attempt ${attempt}:`, error);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
    }
  }
  return null;
};

export const fetchUserProfile = async (userId: string, userEmail: string): Promise<AuthUser> => {
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
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          name: userEmail?.split('@')[0] || 'User',
          role: 'USER', // Default to USER, admin status managed separately
          is_admin: false,
          is_super_admin: false,
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
        role: (newProfile.is_admin ? 'ADMIN' : 'USER') as 'ADMIN' | 'USER',
        displayName: newProfile.name
      };
    } else {
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: (profile.is_admin ? 'ADMIN' : 'USER') as 'ADMIN' | 'USER',
        displayName: profile.name
      };
    }
  } catch (error) {
    console.error('💥 Error in fetchUserProfile:', error);
    throw error;
  }
};
