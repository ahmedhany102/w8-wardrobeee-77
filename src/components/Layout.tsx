
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield, ShoppingCart, Home, Package, Clock, Menu, X, Mail } from "lucide-react";
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
    toast.success("Logged out successfully");
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
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:text-red-300 hover:bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-2 py-4 w-full pb-24">
        {children}
      </main>
      
      {/* Footer with proper spacing to avoid overlap with bottom nav */}
      <footer className="mt-auto py-6 px-4 border-t border-gray-800 bg-gray-900 mb-16">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-3 md:mb-0 flex flex-col items-center md:items-start">
              <p className="text-gray-400 text-sm">© 2025 All rights reserved. W8 Company</p>
              <p className="text-gray-500 text-xs mt-1">Dev By Ahmed Hany</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/contact" 
                className="text-gray-400 hover:text-green-400 transition-colors flex items-center"
                aria-label="Contact"
              >
                <Mail className="w-4 h-4 mr-1" />
                <span className="text-xs">Contact</span>
              </Link>
              <a 
                href="https://www.instagram.com/_.w_8._/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4" viewBox="0 0 16 16">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/ahmed-hany-436342257/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Sticky bottom navigation bar - always visible, even for admin */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-green-800 shadow-lg py-3 px-2 z-50 w-full">
        <div className="container mx-auto flex justify-around items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex flex-col items-center text-green-500 hover:text-green-400 hover:bg-transparent px-1 py-1"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>
          
          {!isAdmin && (
            <Button
              variant="ghost"
              onClick={() => navigate("/cart")}
              className="flex flex-col items-center text-green-500 hover:text-green-400 hover:bg-transparent relative px-1 py-1"
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
            className="flex flex-col items-center text-green-500 hover:text-green-400 hover:bg-transparent px-1 py-1"
          >
            <span className="h-5 w-5 flex items-center justify-center text-lg">🔥</span>
            <span className="text-xs mt-1">Offers</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate("/contact")}
            className="flex flex-col items-center text-green-500 hover:text-green-400 hover:bg-transparent px-1 py-1"
          >
            <Mail className="h-5 w-5" />
            <span className="text-xs mt-1">Contact</span>
          </Button>
          
          {!isAdmin ? (
            <Button
              variant="ghost"
              onClick={() => navigate("/orders")}
              className="flex flex-col items-center text-green-500 hover:text-green-400 hover:bg-transparent px-1 py-1"
            >
              <Package className="h-5 w-5" />
              <span className="text-xs mt-1">Orders</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="flex flex-col items-center text-green-500 hover:text-green-400 hover:bg-transparent px-1 py-1"
            >
              <Shield className="h-5 w-5" />
              <span className="text-xs mt-1">Admin</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center text-green-500 hover:text-green-400 hover:bg-transparent px-1 py-1"
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
