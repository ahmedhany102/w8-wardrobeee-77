
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield, ShoppingCart, Home, Package, Clock } from "lucide-react";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Sync the cart count between top and bottom navigation
  useEffect(() => {
    const updateCartCount = () => {
      const userCart = localStorage.getItem('userCart');
      if (userCart) {
        try {
          const cart = JSON.parse(userCart);
          const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartCount(count);
        } catch (error) {
          console.error('Error parsing cart data', error);
        }
      } else {
        setCartCount(0);
      }
    };
    
    // Initial count
    updateCartCount();
    
    // Listen for storage events to update cart count
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for cart updates within the same window
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-900 to-black text-white">
      <header className="bg-black border-b border-green-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
            <span className="font-bold text-2xl text-green-500">W8</span>
          </Link>
          <nav className="flex items-center flex-wrap gap-2 mt-2 sm:mt-0">
            {user ? (
              <>
                <span className="text-sm hidden sm:inline-block mr-2">
                  Welcome, {user.name.includes('@') ? user.name.split('@')[0] : user.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-green-800/30 transition-all"
                  onClick={() => navigate("/")}
                >
                  <Home className="h-4 w-4 mr-1" />
                  <span>Products</span>
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-800 text-white hover:bg-green-700 border-green-700 transition-all"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    <span>Admin</span>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hover:bg-green-800/30 transition-all"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-800 text-white hover:bg-green-700 border-green-700 transition-all"
                  onClick={() => navigate("/login")}
                >
                  <span>Login</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-800 text-white hover:bg-green-700 border-green-700 transition-all"
                  onClick={() => navigate("/signup")}
                >
                  <span>Sign Up</span>
                </Button>
                {!isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black text-green-500 hover:bg-green-900/30 border-green-700 transition-all ml-1"
                    onClick={() => navigate("/admin-login")}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    <span>Admin</span>
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 w-full">
        {children}
      </main>
      
      {/* Bottom navigation bar */}
      {user && (
        <div className="sticky bottom-0 bg-black border-t border-green-800 shadow-lg py-3 px-4 z-50">
          <div className="container mx-auto flex justify-around items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex flex-col items-center text-green-500 hover:text-green-400"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate("/cart")}
              className="flex flex-col items-center text-green-500 hover:text-green-400 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs mt-1">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate("/orders")}
              className="flex flex-col items-center text-green-500 hover:text-green-400"
            >
              <Package className="h-5 w-5" />
              <span className="text-xs mt-1">Orders</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate("/tracking")}
              className="flex flex-col items-center text-green-500 hover:text-green-400"
            >
              <Clock className="h-5 w-5" />
              <span className="text-xs mt-1">Track</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center text-green-500 hover:text-green-400"
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </Button>
          </div>
        </div>
      )}
      
      <footer className="bg-black border-t border-green-900 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} W8 - Best Shopping Experience
        </div>
      </footer>
    </div>
  );
};

export default Layout;
