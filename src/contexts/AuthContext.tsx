// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import UserDatabase from "@/models/UserDatabase";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

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
const ADMIN_PASSWORD = "Ahmed hany11*";

const MOCK_USERS_KEY = "mock_users";

const getMockUsers = () => {
  const users = localStorage.getItem(MOCK_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveMockUser = (email: string, password: string, name: string = "") => {
  const users = getMockUsers();

  // تأكد أن الإيميل غير موجود أصلاً
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return false;

  users.push({
    id: `user-${Date.now()}`,
    email,
    password,
    name: name || email.split("@")[0],
    role: "USER"
  });

  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  recordActivity(`User registered: ${email}`, "user");
  return true;
};

const recordActivity = (description: string, type: string = "system") => {
  const logs = JSON.parse(localStorage.getItem("activities") || "[]");
  logs.unshift({
    id: `log-${Date.now()}`,
    description,
    timestamp: new Date().toISOString(),
    type
  });
  localStorage.setItem("activities", JSON.stringify(logs.slice(0, 20)));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    const data = localStorage.getItem("currentUser");
    if (data) {
      setUser(JSON.parse(data));
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (loginAttempts >= 5) {
      toast.error("Too many login attempts.");
      return false;
    }

    const users = getMockUsers();
    // مقارنة الإيميل بدون حساسية حالة الأحرف
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      const loggedUser: User = {
        id: found.id,
        email: found.email,
        name: found.name,
        role: "USER"
      };
      localStorage.setItem("currentUser", JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoginAttempts(0);
      recordActivity(`User logged in: ${email}`, "user");
      toast.success("Login successful!");
      return true;
    } else {
      setLoginAttempts(prev => prev + 1);
      toast.error("Invalid email or password.");
      recordActivity(`Failed login attempt: ${email}`, "security");
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    if (loginAttempts >= 5) {
      toast.error("Too many admin login attempts.");
      return false;
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: "admin-1",
        email,
        name: "Ahmed Hany",
        role: "ADMIN"
      };
      localStorage.setItem("currentUser", JSON.stringify(adminUser));
      setUser(adminUser);
      setLoginAttempts(0);
      recordActivity(`Admin logged in`, "admin");
      toast.success("Admin login successful!");
      return true;
    } else {
      setLoginAttempts(prev => prev + 1);
      toast.error("Invalid admin credentials.");
      recordActivity(`Failed admin login attempt: ${email}`, "security");
      return false;
    }
  };

  const signup = async (email: string, password: string, name = ""): Promise<boolean> => {
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      toast.error("You cannot register with the admin email.");
      return false;
    }

    const success = saveMockUser(email, password, name);
    if (!success) {
      toast.error("Email already registered.");
      return false;
    }

    // إضافة المستخدم في قاعدة بيانات وهمية (اختياري حسب مشروعك)
    const db = UserDatabase.getInstance();
    db.addUser({
      id: `user-${Date.now()}`,
      name: name || email.split("@")[0],
      email,
      password: btoa(password), // تشفير بسيط، لكن في تخزين حقيقي يفضل تجنب الباسورد واضح
      isAdmin: false,
      isBlocked: false,
      createdAt: new Date().toISOString()
    });

    // تسجيل دخول أوتوماتيكي بعد التسجيل
    const loggedIn = await login(email, password);
    if (loggedIn) {
      toast.success("Registration successful and logged in!");
      return true;
    } else {
      toast.error("Registration succeeded but login failed.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    recordActivity("User logged out", "user");
    toast.success("Logged out successfully.");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, adminLogin, signup, logout, isAdmin: user?.role === "ADMIN", checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
