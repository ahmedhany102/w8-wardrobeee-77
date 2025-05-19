import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import UserDatabase from '../models/UserDatabase';
import { User } from '@/models/User';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "ahmedhanyseifeldien@gmail.com";
const ADMIN_PASSWORD = "Ahmedhany11*";

// Record activity for admin dashboard
const recordActivity = (description: string, type: string = "system") => {
  try {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const newActivity = {
      id: `act-${Date.now()}`,
      description,
      timestamp: new Date().toISOString(),
      type
    };
    
    const updatedActivities = [newActivity, ...activities].slice(0, 20);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
  } catch (error) {
    console.error("Error recording activity:", error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('currentUser');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication check failed", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (loginAttempts >= 5) {
        toast.error("Too many login attempts. Please try again later.");
        recordActivity(`Login attempt blocked due to rate limiting: ${email}`, "security");
        return false;
      }

      const userDb = UserDatabase.getInstance();
      const foundUser = await userDb.loginUser(email, password);
      
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        setLoginAttempts(0);
        recordActivity(`User logged in: ${foundUser.name}`, "user");
        return true;
      } else {
        setLoginAttempts(prev => prev + 1);
        recordActivity(`Failed login attempt: ${email}`, "security");
        toast.error("Invalid email or password");
        return false;
      }
    } catch (error) {
      console.error("Login failed", error);
      recordActivity(`Login error: ${email}`, "error");
      toast.error("Login failed. Please try again.");
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      if (loginAttempts >= 5) {
        toast.error("Too many login attempts. Please try again later.");
        recordActivity(`Admin login attempt blocked due to rate limiting: ${email}`, "security");
        return false;
      }

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser: User = {
          id: "admin-1",
          email: ADMIN_EMAIL,
          name: "Ahmed Hany",
          role: "ADMIN",
          password: ADMIN_PASSWORD,
          isAdmin: true,
          isSuperAdmin: true,
          isBlocked: false,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          ipAddress: '192.168.1.1',
          status: 'ACTIVE'
        };
        setUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        setLoginAttempts(0);
        recordActivity(`Admin logged in: ${adminUser.name}`, "security");
        return true;
      } else {
        setLoginAttempts(prev => prev + 1);
        recordActivity(`Failed admin login attempt: ${email}`, "security");
        toast.error("Invalid admin credentials");
        return false;
      }
    } catch (error) {
      console.error("Admin login failed", error);
      recordActivity(`Admin login error: ${email}`, "error");
      toast.error("Admin login failed. Please try again.");
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string = ""): Promise<boolean> => {
    try {
      if (!email.includes('@')) {
        toast.error("Please enter a valid email address");
        return false;
      }
      
      if (email === ADMIN_EMAIL) {
        toast.error("This email is reserved. Please use a different email address.");
        recordActivity(`Attempted registration with reserved email: ${email}`, "security");
        return false;
      }

      const userDb = UserDatabase.getInstance();
      const success = await userDb.registerUser({
        name: name || email.split('@')[0],
        email,
        password,
        role: 'USER',
        status: 'ACTIVE',
        isAdmin: false,
        isSuperAdmin: false,
        isBlocked: false
      });

      if (!success) {
        toast.error("Email already registered. Please login or use a different email.");
        recordActivity(`Registration attempt with existing email: ${email}`, "user");
        return false;
      }

      // Try to login immediately after successful registration
      const loginSuccess = await login(email, password);
      if (loginSuccess) {
        toast.success("Registration successful! You are now logged in.");
        return true;
      } else {
        toast.error("Registration successful but login failed. Please try logging in manually.");
        return false;
      }
    } catch (error) {
      console.error("Signup failed", error);
      recordActivity(`Registration error: ${email}`, "error");
      toast.error("Registration failed. Please try again later.");
      return false;
    }
  };

  const logout = async () => {
    try {
      if (user) {
        recordActivity(`User logged out: ${user.name}`, "user");
      }
      localStorage.removeItem('currentUser');
      setUser(null);
    } catch (error) {
      console.error("Logout request failed", error);
      setUser(null);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        adminLogin,
        signup,
        logout,
        isAdmin,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
