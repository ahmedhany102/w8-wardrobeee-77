import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import type { AuthUser, AuthContextType } from '@/types/auth';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { fetchUserProfile, clearSessionData } from '@/utils/authUtils';

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
  
  // سنحتفظ بـ useAuthValidation فقط لاستخدام setLoading
  // ولكننا لن نستخدم validateSessionAndUser في الـ useEffect
  const { validateSessionAndUser, loading, setLoading } = useAuthValidation();
  const { login, adminLogin, signup, logout } = useAuthOperations();

  const checkAuthStatus = async () => {
    // يمكن ترك هذه الدالة كما هي، هي تُستخدم يدويًا فقط
    await validateSessionAndUser(setSession, setUser);
  };

  useEffect(() => {
    console.log('🚀 Initializing auth system...');
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔔 Auth state changed:', event, newSession?.user?.email || 'No user');
        
        // =======================
        //
        //  ✅  الإصلاح الأول:
        //  إعادة التحقق من حدث تسجيل الخروج العابر (من الكود القديم)
        //
        // =======================
        if (event === 'SIGNED_OUT') {
          console.log('👋 SIGNED_OUT event received');

          // لازم نشوف هل في Session حقيقية موجودة ولا لأ
          const { data } = await supabase.auth.getSession();

          if (data.session) {
            console.log('⏳ Ignoring transient SIGNED_OUT, session still present');
            return; // تجاهل الحدث العابر، الجلسة لا تزال موجودة
          }

          // فعلاً مفيش سيشن → ده logout حقيقي
          console.log('🚪 User fully signed out, clearing state');
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            console.log('🔐 User signed in or token refreshed - processing...');
            
            // CRITICAL: Check if user is banned before allowing access
            console.log('🔍 Checking ban status in auth state change...');
            const { data: canAuth, error: authCheckError } = await supabase.rpc('can_user_authenticate', {
              _user_id: newSession.user.id
            });

            if (authCheckError) {
              console.error('❌ Auth check error:', authCheckError);
            }

            if (!canAuth) {
              console.warn('🚫 BLOCKED: Banned user detected in auth state change, signing out:', newSession.user.email);
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setLoading(false);
              toast.error('تم حظر حسابك. تم تسجيل الخروج تلقائياً');
              return;
            }
            
            setSession(newSession);
            
            try {
              const userData = await fetchUserProfile(newSession.user.id, newSession.user.email!);
              setUser(userData);
              console.log('✅ Profile loaded after auth change:', userData);
            } catch (error) {
              console.error('❌ Failed to load profile after auth change:', error);
              // Fallback user data with default USER role
              const basicUserData: AuthUser = {
                id: newSession.user.id,
                email: newSession.user.email!,
                name: newSession.user.email?.split('@')[0] || 'User',
                role: 'USER'
              };
              setUser(basicUserData);
            }
            setLoading(false);
          }
        }
      }
    );

    // =======================
    //
    //  ✅  الإصلاح الثاني:
    //  تم حذف استدعاء initializeAuth() بالكامل من هنا
    //  لمنع سباق الحالات. نعتمد فقط على المستمع أعلاه.
    //
    // =======================

    return () => {
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps 
  // أضفت التعليق السابق لتعطيل تحذير ESLint لأننا لا نريد إضافة أي dependencies هنا

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

  console.log('🏪 Auth Context State:', {
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
