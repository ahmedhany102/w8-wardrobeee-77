
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield, ShoppingCart, Home, Package, Clock, Menu, X } from "lucide-react";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Sync the cart count between top and bottom navigation
  useEffect(() => {
    const updateCartCount = () => {
      // Don't show cart for admin users
      if (isAdmin) {
        setCartCount(0);
        return;
      }
      
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
  }, [isAdmin]);

  // Get display name (name, not email)
  const getDisplayName = () => {
    if (!user || !user.name) return "User";
    return user.name.includes('@') ? user.name.split('@')[0] : user.name;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-900 to-black text-white w-full overflow-hidden">
      <header className="bg-black border-b border-green-800 shadow-md w-full">
        <div className="container mx-auto px-2 py-3">
          {user && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Welcome, {getDisplayName()}
              </span>
              
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-800 text-white hover:bg-green-700 border-green-700 transition-all"
                  onClick={() => navigate("/admin")}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  <span>Admin Panel</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-2 py-4 w-full pb-20">
        {children}
      </main>
      
      {/* Sticky bottom navigation bar - always visible, even for admin */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-green-800 shadow-lg py-3 px-2 z-50 w-full">
        <div className="container mx-auto flex justify-around items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex flex-col items-center text-green-500 hover:text-green-400 px-1 py-1"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>
          
          {!isAdmin && (
            <Button
              variant="ghost"
              onClick={() => navigate("/cart")}
              className="flex flex-col items-center text-green-500 hover:text-green-400 relative px-1 py-1"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs mt-1">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={() => navigate("/offers")}
            className="flex flex-col items-center text-green-500 hover:text-green-400 px-1 py-1"
          >
            <span className="h-5 w-5 flex items-center justify-center text-lg">🔥</span>
            <span className="text-xs mt-1">Offers</span>
          </Button>
          
          {!isAdmin ? (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/orders")}
                className="flex flex-col items-center text-green-500 hover:text-green-400 px-1 py-1"
              >
                <Package className="h-5 w-5" />
                <span className="text-xs mt-1">Orders</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate("/tracking")}
                className="flex flex-col items-center text-green-500 hover:text-green-400 px-1 py-1"
              >
                <Clock className="h-5 w-5" />
                <span className="text-xs mt-1">Track</span>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="flex flex-col items-center text-green-500 hover:text-green-400 px-1 py-1"
            >
              <Shield className="h-5 w-5" />
              <span className="text-xs mt-1">Admin</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center text-green-500 hover:text-green-400 px-1 py-1"
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Layout;
