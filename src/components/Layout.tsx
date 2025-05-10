
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield, ShoppingCart, Home } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <header className="bg-purple-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="font-bold text-2xl">w8</span>
            <span className="text-xl">Market</span>
          </Link>
          <nav className="flex items-center flex-wrap gap-2 mt-2 sm:mt-0">
            {user ? (
              <>
                <span className="text-sm hidden sm:inline-block mr-2">
                  Welcome, {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-purple-600 transition-all"
                  onClick={() => navigate("/")}
                >
                  <Home className="h-4 w-4 mr-1" />
                  <span>Products</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-purple-600 transition-all"
                  onClick={() => navigate("/cart")}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  <span>Cart</span>
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-purple-600 text-white hover:bg-purple-500 border-purple-500 transition-all"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    <span>Admin</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-600 text-white hover:bg-purple-500 border-purple-500 transition-all"
                  onClick={() => navigate("/profile")}
                >
                  <User className="h-4 w-4 mr-1" />
                  <span>Profile</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hover:bg-purple-600 transition-all"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="link"
                  size="sm"
                  className="text-white hover:text-purple-200 transition-all"
                  onClick={() => navigate("/login")}
                >
                  <span>Login</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-600 text-white hover:bg-purple-500 border-purple-500 transition-all"
                  onClick={() => navigate("/signup")}
                >
                  <span>Sign Up</span>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 w-full">
        {children}
      </main>
      <footer className="bg-purple-800 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} w8 Market - Developed by Ahmed Hany
        </div>
      </footer>
    </div>
  );
};

export default Layout;
