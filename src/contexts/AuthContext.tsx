// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import UserDatabase from "@/models/UserDatabase";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
  displayName?: string; // Add displayName as optional property
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
  if (users.find(u => u.email === email)) return false;
  
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    name: name || email.split("@")[0],
    role: "USER"
  };
  
  users.push(newUser);
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  recordActivity(`User registered: ${email}`, "user");
  return newUser; // Return the new user object instead of just true
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
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const loggedUser: User = {
        id: found.id,
        email: found.email,
        name: found.name,
        role: "USER",
        isSuperAdmin: false // Set explicit default value
      };
      localStorage.setItem("currentUser", JSON.stringify(loggedUser));
      setUser(loggedUser);
      setLoginAttempts(0);
      recordActivity(`User logged in: ${email}`, "user");
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
        role: "ADMIN",
        isSuperAdmin: true // Set admin as super admin
      };
      localStorage.setItem("currentUser", JSON.stringify(adminUser));
      setUser(adminUser);
      setLoginAttempts(0);
      recordActivity(`Admin logged in`, "admin");
      return true;
    } else {
      setLoginAttempts(prev => prev + 1);
      toast.error("Invalid admin credentials.");
      return false;
    }
  };

  const signup = async (email: string, password: string, name = ""): Promise<boolean> => {
    if (email === ADMIN_EMAIL) {
      toast.error("You cannot register with the admin email.");
      return false;
    }

    // Save user and get the new user object
    const newUser = saveMockUser(email, password, name);
    if (!newUser) {
      toast.error("Email already registered.");
      return false;
    }

    // Add to UserDatabase
    const db = UserDatabase.getInstance();
    await db.addUser({
      name: name || email.split("@")[0],
      email,
      password: btoa(password),
      isAdmin: false,
      isBlocked: false,
      role: 'USER',
      status: 'ACTIVE',
      isSuperAdmin: false, // Add this property explicitly
    });

    // Automatically log the user in instead of calling login method
    const loggedUser: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: "USER",
      isSuperAdmin: false // Set explicit value
    };
    
    localStorage.setItem("currentUser", JSON.stringify(loggedUser));
    setUser(loggedUser);
    recordActivity(`User registered and logged in: ${email}`, "user");
    toast.success("Registration successful!");
    
    return true;
  };

  // Ensure the logout function is defined correctly without requiring arguments
  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    recordActivity("User logged out", "user");
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
