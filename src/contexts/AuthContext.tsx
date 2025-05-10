
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "http://localhost:8080/api"; // Backend API URL
const ADMIN_EMAIL = "ahmedhanyseifeldin@gmail.com"; // Hardcoded admin email
const ADMIN_PASSWORD = "Ahmed hany11*"; // Hardcoded admin password for validation

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
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include", // Important for cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
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
            role: "ROLE_ADMIN"
          };
          setUser(adminUser);
          setLoginAttempts(0); // Reset attempts on success
          return true;
        } else {
          setLoginAttempts(prev => prev + 1);
          toast.error("Invalid password for admin account");
          return false;
        }
      }

      // Regular user login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setLoginAttempts(0); // Reset attempts on success
        return true;
      } else {
        // Increment failed attempts
        setLoginAttempts(prev => prev + 1);
        
        if (response.status === 401) {
          toast.error("Invalid email or password");
        } else if (response.status === 429) {
          toast.error("Too many login attempts. Please try again later.");
        } else {
          toast.error("Login failed. Please try again.");
        }
        return false;
      }
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed. Please try again.");
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      // Prevent users from registering with the admin email
      if (email === ADMIN_EMAIL) {
        toast.error("This email is reserved. Please use a different email address.");
        return false;
      }

      // Since the backend API is not available in this demo, we'll mock a successful registration
      // In a real application, this would be an actual API call to register the user
      
      // Mock user for demonstration purposes
      const mockUser = {
        id: `user-${Date.now()}`,
        email: email,
        role: "ROLE_USER"
      };
      
      // In a real app, we would send this to an API endpoint
      // For now, we'll just simulate a successful registration
      toast.success("Registration successful! You can now log in.");
      return true;
    } catch (error) {
      console.error("Signup failed", error);
      toast.error("Registration failed. Please try again later.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
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
