
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ADMIN_EMAIL = "ahmedhanyseifeldien@gmail.com";

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
  const { adminLogin, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && isAdmin && !authLoading) {
      console.log('Admin already logged in, redirecting to admin panel');
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: ADMIN_EMAIL,
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      console.log('Attempting admin login with:', data.email);
      
      const success = await adminLogin(data.email, data.password);
      
      if (success) {
        console.log('Admin login successful, navigating to admin panel');
        navigate("/admin");
      }
    } catch (error) {
      console.error('Admin login submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

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
