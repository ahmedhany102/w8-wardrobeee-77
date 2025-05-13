
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ADMIN_EMAIL = "ahmedhanyseifeldien@gmail.com"; // Updated admin email
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds

const adminLoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
  const { login, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Check if account is locked from localStorage
  useEffect(() => {
    const storedLockTime = localStorage.getItem("adminLockUntil");
    if (storedLockTime) {
      const lockTime = parseInt(storedLockTime, 10);
      if (lockTime > Date.now()) {
        setLockedUntil(lockTime);
      } else {
        localStorage.removeItem("adminLockUntil");
      }
    }

    const storedAttempts = localStorage.getItem("adminLoginAttempts");
    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts, 10));
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockedUntil) {
      const timer = setInterval(() => {
        const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(timer);
          setLockedUntil(null);
          setCountdown(null);
          localStorage.removeItem("adminLockUntil");
          setAttempts(0);
          localStorage.setItem("adminLoginAttempts", "0");
        } else {
          setCountdown(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockedUntil]);

  // Redirect if already logged in as admin
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin");
    } else if (user && !isAdmin) {
      toast.error("You don't have admin privileges");
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    // If account is locked, prevent submission
    if (lockedUntil && lockedUntil > Date.now()) {
      return;
    }

    setIsSubmitting(true);
    
    // Check if attempting to login with the admin email
    if (data.email !== ADMIN_EMAIL) {
      handleFailedAttempt();
      toast.error("Invalid admin credentials");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const success = await login(data.email, data.password);
      if (success) {
        if (isAdmin) {
          // Reset attempts on successful login
          setAttempts(0);
          localStorage.setItem("adminLoginAttempts", "0");
          toast.success("Admin login successful!");
          navigate("/admin");
        } else {
          handleFailedAttempt();
          toast.error("You don't have admin privileges");
          navigate("/");
        }
      } else {
        handleFailedAttempt();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem("adminLoginAttempts", newAttempts.toString());
    
    // Lock account after max attempts
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_TIME;
      setLockedUntil(lockUntil);
      localStorage.setItem("adminLockUntil", lockUntil.toString());
      toast.error(`Too many failed attempts. Account locked for ${LOCKOUT_TIME / 60000} minutes.`);
    } else {
      toast.error(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[80vh] w-full">
        <Card className="w-full max-w-md shadow-lg border-green-800 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
            <div className="flex justify-center mb-2">
              <Shield className="h-10 w-10" />
            </div>
            <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
            <CardDescription className="text-center text-gray-200">
              Secure area - Authorized personnel only
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 bg-gradient-to-b from-white to-green-50">
            {lockedUntil && lockedUntil > Date.now() ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <AlertTriangle className="text-red-500 h-12 w-12 mb-2" />
                <h2 className="text-xl font-bold text-red-500">Account Locked</h2>
                <p className="text-gray-600 mt-2">
                  Too many failed login attempts. Please try again in {countdown} seconds.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="admin@example.com"
                            {...field}
                            autoComplete="username"
                            disabled={isSubmitting}
                            className="transition-all hover:border-green-500 focus:ring-green-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            autoComplete="current-password"
                            disabled={isSubmitting}
                            className="transition-all hover:border-green-500 focus:ring-green-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-green-800 hover:bg-green-900 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Verifying..." : "Admin Login"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center bg-green-50 rounded-b-md">
            <Button 
              variant="link" 
              className="text-green-800" 
              onClick={() => navigate("/login")}
            >
              Return to User Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLogin;
