
import React from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Lock } from "lucide-react";

const Index = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to MyTestSite</h1>
          <p className="text-xl text-gray-600 mb-6">
            A secure testing application with robust authentication and authorization
          </p>
          {!user && (
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="font-medium"
              >
                Log In
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-navy-600 hover:bg-navy-700 font-medium"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Authentication System
              </CardTitle>
              <CardDescription>
                Secure login and user management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our system features secure password handling with bcrypt hashing, 
                rate limiting for protection against brute force attacks, and a
                comprehensive user management system.
              </p>
            </CardContent>
            <CardFooter>
              {user ? (
                <p className="text-sm text-gray-500">
                  You are currently logged in as{" "}
                  <span className="font-semibold">{user.email}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Sign up or log in to access the system
                </p>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Role-Based Access Control
              </CardTitle>
              <CardDescription>
                Carefully designed permission system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our application implements strict role-based access control with
                separate user and admin roles. All sensitive operations are
                protected by server-side validation and proper authorization checks.
              </p>
            </CardContent>
            <CardFooter>
              {user ? (
                <p className="text-sm text-gray-500">
                  Your current role: <span className="font-semibold">{user.role.replace('ROLE_', '')}</span>
                  {isAdmin && " (Full administrative access)"}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Login to see your assigned role and permissions
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
