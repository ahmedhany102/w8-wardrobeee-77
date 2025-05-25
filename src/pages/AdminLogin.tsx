
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ADMIN_EMAIL = "ahmedhanyseifeldien@gmail.com";
const ADMIN_PASSWORD = "Ahmed hany11*";
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 2 * 60 * 1000;

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
  const { adminLogin, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Load attempt data from localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem("adminLoginAttempts");
    const storedLockUntil = localStorage.getItem("adminLockUntil");
    
    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockUntil) {
      const lockTime = parseInt(storedLockUntil);
      if (lockTime > Date.now()) {
        setLockedUntil(lockTime);
      } else {
        localStorage.removeItem("adminLockUntil");
        localStorage.setItem("adminLoginAttempts", "0");
        setAttempts(0);
      }
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
    }
  }, [user, isAdmin, navigate]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: ADMIN_EMAIL,
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    if (lockedUntil && lockedUntil > Date.now()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Attempting admin login with:', data.email);
      
      const success = await adminLogin(data.email, data.password);
      
      if (success) {
        setAttempts(0);
        localStorage.setItem("adminLoginAttempts", "0");
        navigate("/admin");
      } else {
        handleFailedAttempt();
      }
    } catch (error) {
      console.error('Admin login submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      handleFailedAttempt();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem("adminLoginAttempts", newAttempts.toString());
    
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
            <div className="text-center text-sm text-yellow-200 mt-2">
              Email: {ADMIN_EMAIL}
            </div>
          </CardHeader>
          <CardContent className="pt-6 bg-gradient-to-b from-white to-green-50 dark:from-gray-800 dark:to-gray-900">
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
                            className="transition-all hover:border-green-500 focus:ring-green-700 dark:bg-gray-800 dark:text-white"
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
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••" 
                              {...field} 
                              autoComplete="current-password"
                              disabled={isSubmitting}
                              className="transition-all hover:border-green-500 focus:ring-green-700 pr-10 dark:bg-gray-800 dark:text-white"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-500" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-500" />
                              )}
                            </button>
                          </div>
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
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      "Admin Login"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center bg-green-50 dark:bg-gray-900 rounded-b-md">
            <Button 
              variant="link" 
              className="text-green-800 dark:text-green-400" 
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
