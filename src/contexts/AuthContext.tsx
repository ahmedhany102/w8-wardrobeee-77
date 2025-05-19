import React, { createContext, useContext, useState, useEffect } from 'react';
import UserDatabase from '@/models/UserDatabase';
// import { User } from '@/models/UserDatabase'; // تم حذف الاستيراد من هنا
import { toast } from 'sonner';

// قم باستيراد User من UserDatabase الآن بعد إعادة تعريفها هناك
import { User } from '@/models/UserDatabase';

// تعريف واجهة المستخدم هنا مباشرة
// interface User { ... }

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'ipAddress'>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);
  const userDb = UserDatabase.getInstance();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const session = localStorage.getItem('session');
        if (session) {
          const { userId, expiresAt } = JSON.parse(session);
          
          // Check if session is expired
          if (new Date(expiresAt) > new Date()) {
            // يجب تحديث هذه الدالة في UserDatabase لترجع User بدون كلمة مرور
            const user = userDb.getUserById(userId);
            if (user) {
              setUser(user as Omit<User, 'password'>);
            } else {
              // Clear invalid session
              localStorage.removeItem('session');
            }
          } else {
            // Clear expired session
            localStorage.removeItem('session');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const createSession = (userId: string) => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

    const session = {
      userId,
      expiresAt: expiresAt.toISOString()
    };

    localStorage.setItem('session', JSON.stringify(session));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // يجب تحديث هذه الدالة في UserDatabase لترجع User بدون كلمة مرور
      const user = await userDb.loginUser(email, password);
      if (user) {
        setUser(user as Omit<User, 'password'>);
        createSession(user.id);
        toast.success('Login successful');
        return true;
      } else {
        toast.error('Invalid email or password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('session');
    toast.success('Logged out successfully');
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'ipAddress'>): Promise<boolean> => {
    try {
      // يجب تحديث هذه الدالة في UserDatabase لتقبل userData كـ Omit<User, ...>
      const success = await userDb.registerUser(userData);
      if (success) {
        toast.success('Registration successful');
        return true;
      } else {
        toast.error('Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // يجب تحديث هذه الدالة في UserDatabase لتقبل المعلمات بشكل صحيح
      const success = await userDb.changePassword(user.id, currentPassword, newPassword);
      if (success) {
        toast.success('Password changed successfully');
        return true;
      } else {
        toast.error('Failed to change password');
        return false;
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('An error occurred while changing password');
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
