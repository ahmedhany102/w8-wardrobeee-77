
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

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
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "http://localhost:8080/api"; // Backend API URL
const ADMIN_EMAIL = "ahmedhanyseifeldin@gmail.com"; // Hardcoded admin email
const ADMIN_PASSWORD = "Ahmed hany11*"; // Hardcoded admin password for validation

// Mock user storage for demo purposes
const MOCK_USERS_STORAGE_KEY = "mock_users";

// Helper function to get mock users from localStorage
const getMockUsers = (): {email: string, password: string, id: string, name: string}[] => {
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
      name: name || email.split('@')[0]
    });
    localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));
    return true;
  }
  return false;
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
        
        // Set admin role if the user is the hardcoded admin email
        if (userData.email === ADMIN_EMAIL) {
          userData.role = "ROLE_ADMIN";
        }
        
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
        return false;
      }

      // Special handling for admin login
      if (email === ADMIN_EMAIL) {
        // For demo purposes only - in production this should be handled by backend
        if (password === ADMIN_PASSWORD) {
          const adminUser = {
            id: "admin-1",
            email: ADMIN_EMAIL,
            name: "Admin",
            role: "ROLE_ADMIN"
          };
          setUser(adminUser);
          // Store user in localStorage (simulate session)
          localStorage.setItem('currentUser', JSON.stringify(adminUser));
          setLoginAttempts(0); // Reset attempts on success
          return true;
        } else {
          setLoginAttempts(prev => prev + 1);
          toast.error("Invalid password for admin account");
          return false;
        }
      }

      // Regular user login - check against mock users
      const users = getMockUsers();
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name || email.split('@')[0],
          role: "ROLE_USER"
        };
        
        setUser(userData);
        // Store user in localStorage (simulate session)
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log("Login successful, stored user:", userData);
        setLoginAttempts(0); // Reset attempts on success
        return true;
      } else {
        // Increment failed attempts
        setLoginAttempts(prev => prev + 1);
        toast.error("Invalid email or password");
        return false;
      }
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed. Please try again.");
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string = ""): Promise<boolean> => {
    try {
      // Prevent users from registering with the admin email
      if (email === ADMIN_EMAIL) {
        toast.error("This email is reserved. Please use a different email address.");
        return false;
      }

      // Save user credentials to mock storage
      const success = saveMockUser(email, password, name);
      
      if (!success) {
        toast.error("Email already registered. Please login or use a different email.");
        return false;
      }
      
      // In a real app, we would send this to an API endpoint
      console.log("Registration successful:", { email, name });
      
      // Automatically log in the user after successful registration
      await login(email, password);
      
      toast.success("Registration successful! You are now logged in.");
      return true;
    } catch (error) {
      console.error("Signup failed", error);
      toast.error("Registration failed. Please try again later.");
      return false;
    }
  };

  const logout = async () => {
    try {
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
  const isAdmin = user?.email === ADMIN_EMAIL || user?.role === "ROLE_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
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
