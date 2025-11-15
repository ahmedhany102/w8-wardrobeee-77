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
  
  // سنستخدم فقط setLoading من هذا الـ hook
  const { loading, setLoading } = useAuthValidation();
  const { login, adminLogin, signup, logout } = useAuthOperations();

  // سنحتفظ بهذه الدالة في حال احتجتها يدويًا، لكن لن نستخدمها عند بدء التشغيل
  const { validateSessionAndUser } = useAuthValidation();
  const checkAuthStatus = async () => {
    await validateSessionAndUser(setSession, setUser);
  };


  useEffect(() => {
    console.log('🚀 Initializing auth system (v3 - Final Fix)...');
    
    // 1. إعداد المستمع أولاً
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

          // التحقق هل الجلسة لا تزال موجودة (حدث عابر)؟
          const { data } = await supabase.auth.getSession();

          if (data.session) {
            console.log('⏳ Ignoring transient SIGNED_OUT, session still present');
            return; // تجاهل الحدث، انتظر TOKEN_REFRESHED
          }

          // فعلاً مفيش سيشن → ده logout حقيقي
          console.log('🚪 User fully signed out, clearing state');
          setUser(null);
          setSession(null);
          setLoading(false); // <-- هام: إيقاف التحميل
          return;
        }
        
        // =======================
        //
        //  ✅  الإصلاح الثاني:
        //  التعامل مع تسجيل الدخول / تحديث التوكن
        //
        // =======================
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            console.log('🔐 User signed in or token refreshed - processing...');
            
            // (الكود الجيد الذي أضفته للتحقق من الحظر)
            const { data: canAuth, error: authCheckError } = await supabase.rpc('can_user_authenticate', {
              _user_id: newSession.user.id
            });

            if (authCheckError) console.error('❌ Auth check error:', authCheckError);

            if (!canAuth) {
              console.warn('🚫 BLOCKED: Banned user detected, signing out');
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setLoading(false); // <-- هام: إيقاف التحميل
              toast.error('تم حظر حسابك. تم تسجيل الخروج تلقائياً');
              return;
            }
            
            // المستخدم سليم، قم بتسجيل دخوله
            setSession(newSession);
            try {
              const userData = await fetchUserProfile(newSession.user.id, newSession.user.email!);
              setUser(userData);
              console.log('✅ Profile loaded after auth change:', userData);
            } catch (error) {
              console.error('❌ Failed to load profile after auth change:', error);
              const basicUserData: AuthUser = {
                id: newSession.user.id,
                email: newSession.user.email!,
                name: newSession.user.email?.split('@')[0] || 'User',
                role: 'USER'
              };
              setUser(basicUserData);
            }
            setLoading(false); // <-- هام: إيقاف التحميل
            return;
          }
        }
      }
    );

    // =======================
    //
    //  ✅  الإصلاح الثالث (الأهم):
    //  إلغاء سباق الحالات (Race Condition)
    //
    // =======================
    const checkInitialSession = async () => {
      console.log('Checking initial session state...');
      // getSession() تتحقق من الجلسة الحالية
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        // وجدنا جلسة!
        // لا تفعل شيئًا هنا.
        // لأن getSession() ستجعل المستمع (onAuthStateChange)
        // يطلق حدث TOKEN_REFRESHED أو SIGNED_IN
        // وهذا سيمنع حدوث "سباق الحالات"
        console.log('Initial check: Session found. Letting listener handle it.');
      } else {
        // لا توجد جلسة.
        // المستمع (onAuthStateChange) لن يطلق أي حدث.
        // يجب علينا إيقاف التحميل يدويًا.
        // هذا هو السطر الذي كان مفقودًا وتسبب في مشكلتك.
        console.log('Initial check: No session found. Setting loading=false.');
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    };

    // 2. تشغيل التحقق الأولي
    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue = {
    user,
    session,
    login,
    adminLogin,
    signup,
    logout,
    loading,
    isAdmin: user?.role === 'ADMIN',
    checkAuthStatus // أعدنا هذه الدالة
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
