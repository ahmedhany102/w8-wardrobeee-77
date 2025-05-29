
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage // Explicitly use localStorage for session storage
  }
});

// Add auth state monitoring for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔔 Supabase Auth Event:', event);
  console.log('🔑 Session exists:', !!session);
  
  if (session) {
    console.log('👤 User:', session.user.email);
    console.log('🕒 Session expires at:', new Date(session.expires_at! * 1000));
  }
});
