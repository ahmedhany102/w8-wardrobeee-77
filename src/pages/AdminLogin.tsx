
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ADMIN_EMAIL = "ahmedhanyseifeldin@gmail.com";

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
    setIsSubmitting(true);
    
    // Check if attempting to login with the admin email
    if (data.email !== ADMIN_EMAIL) {
      setAttempts(prev => prev + 1);
      toast.error("Invalid admin credentials");
      setIsSubmitting(false);
      
      // Rate limiting
      if (attempts >= 3) {
        toast.error("Too many failed attempts. Please try again later.");
        setTimeout(() => setAttempts(0), 30000); // Reset after 30 seconds
        return;
      }
      
      return;
    }
    
    try {
      const success = await login(data.email, data.password);
      if (success) {
        if (isAdmin) {
          toast.success("Admin login successful!");
          navigate("/admin");
        } else {
          toast.error("You don't have admin privileges");
          navigate("/");
        }
      } else {
        setAttempts(prev => prev + 1);
        
        // Rate limiting
        if (attempts >= 3) {
          toast.error("Too many failed attempts. Please try again later.");
          setTimeout(() => setAttempts(0), 30000); // Reset after 30 seconds
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[80vh] w-full">
        <Card className="w-full max-w-md shadow-lg border-navy-500">
          <CardHeader className="bg-navy-700 text-white rounded-t-md">
            <div className="flex justify-center mb-2">
              <Shield className="h-10 w-10" />
            </div>
            <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
            <CardDescription className="text-center text-gray-200">
              Secure area - Authorized personnel only
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
                          disabled={isSubmitting || attempts >= 3}
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
                          disabled={isSubmitting || attempts >= 3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-navy-600 hover:bg-navy-700"
                  disabled={isSubmitting || attempts >= 3}
                >
                  {isSubmitting ? "Logging in..." : "Admin Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              className="text-navy-600" 
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
