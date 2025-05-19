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

const API_URL = "http://localhost:8080/api"; // Backend API URL
const ADMIN_EMAIL = "ahmedhanyseifeldien@gmail.com"; // Admin email
const ADMIN_PASSWORD = "Ahmed hany11*"; // Admin password for validation

// Mock user storage for demo purposes
const MOCK_USERS_STORAGE_KEY = "mock_users";

// Helper function to get mock users from localStorage
const getMockUsers = (): {email: string, password: string, id: string, name: string, role?: string}[] => {
  const usersJson = localStorage.getItem(MOCK_USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper function to save mock users to localStorage
const saveMockUser = (email: string, password: string, name: string = "") => {
  const users = getMockUsers();
  if (!users.find(u => u.email === email)) {
    users.push({
      id: `user-${Date.now()}`,
      email,
      password,
      name: name || email.split('@')[0],
      role: "USER"
    });
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
    console.log("User registration request sent", { email, name });
    
    // Record activity for admin dashboard
    recordActivity(`New user registered: ${name || email.split('@')[0]} (${email})`, "user");
    
    return true;
  }
  return false;
};

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
    
    const updatedActivities = [newActivity, ...activities].slice(0, 20); // Keep only last 20 activities
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
  } catch (error) {
    console.error("Error recording activity:", error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Check if user is authenticated on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      // Check for user session in localStorage
      const storedUser = localStorage.getItem('currentUser');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } else {
        // Clear any potentially invalid session data
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
      // Check for rate limiting on client side
      if (loginAttempts >= 5) {
        toast.error("Too many login attempts. Please try again later.");
        recordActivity(`Login attempt blocked due to rate limiting: ${email}`, "security");
        return false;
      }

      console.log("Login request sent", { email });

      // Regular user login - check against mock users
      const users = getMockUsers();
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name || email.split('@')[0],
          role: (foundUser.role || "USER") as 'ADMIN' | 'USER',
          password: foundUser.password,
          isAdmin: foundUser.role === "ADMIN",
          isSuperAdmin: false,
          isBlocked: false,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          ipAddress: '0.0.0.0',
          status: 'ACTIVE'
        };
        
        setUser(userData);
        // Store user in localStorage (simulate session)
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log("Login successful, stored user:", userData);
        setLoginAttempts(0); // Reset attempts on success
        
        // Update last login time
        const updatedUsers = users.map(u => {
          if (u.email === email) {
            return { ...u, lastLogin: new Date().toISOString() };
          }
          return u;
        });
        localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
        
        recordActivity(`User logged in: ${userData.name}`, "user");
        return true;
      } else {
        // Increment failed attempts
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

  // Separate admin login function
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check for rate limiting
      if (loginAttempts >= 5) {
        toast.error("Too many login attempts. Please try again later.");
        recordActivity(`Admin login attempt blocked due to rate limiting: ${email}`, "security");
        return false;
      }

      console.log("Admin login request sent", { email });

      // Verify against admin credentials
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
        // Store admin user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        setLoginAttempts(0); // Reset attempts on success
        
        recordActivity(`Admin logged in: ${adminUser.name}`, "security");
        return true;
      } else {
        // Increment failed attempts
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
      // Validate email format
      if (!email.includes('@')) {
        toast.error("Please enter a valid email address");
        return false;
      }
      
      // Prevent users from registering with the admin email
      if (email === ADMIN_EMAIL) {
        toast.error("This email is reserved. Please use a different email address.");
        recordActivity(`Attempted registration with reserved email: ${email}`, "security");
        return false;
      }

      console.log("Registration request sent", { email, name });

      // Add the user to UserDatabase
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

      // Save user credentials to mock storage for backward compatibility
      saveMockUser(email, password, name);

      // Automatically log in the user after successful registration
      await login(email, password);
      
      toast.success("Registration successful! You are now logged in.");
      return true;
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
      
      // Clear user data from localStorage
      localStorage.removeItem('currentUser');
      setUser(null);
    } catch (error) {
      console.error("Logout request failed", error);
      // Always clear the user data locally even if the request fails
      setUser(null);
    }
  };

  // Check if user is admin
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
