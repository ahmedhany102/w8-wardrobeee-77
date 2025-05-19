
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Menu, User, ShoppingCart, Home, Phone, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMediaQuery } from "@/hooks/use-mobile";
import CartDatabase from "@/models/CartDatabase";

const MainNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const updateCartCount = async () => {
      const cartDb = await CartDatabase.getInstance();
      const cartItems = await cartDb.getCartItems();
      setCartItemCount(cartItems.length);
    };

    updateCartCount();

    // Listen for cart updates
    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Dynamic path-based visibility
  const showOnlyOnPaths = (paths: string[]) => {
    return paths.includes(location.pathname);
  };

  const hideOnPaths = (paths: string[]) => {
    return !paths.includes(location.pathname);
  };

  // Check if we're on user profile or admin-related pages
  const isOnAdminPages = location.pathname.startsWith('/admin');
  const isOnProfilePage = location.pathname === '/profile';

  return (
    <nav className={`w-full py-2 shadow-md bg-green-900 text-white z-50 ${isOpen ? "h-screen fixed top-0 left-0 flex flex-col" : ""}`}>
      <div className={`container mx-auto flex ${isOpen ? "flex-col h-full" : "flex-row"} justify-between items-center px-4`}>
        <div className="flex justify-between w-full md:w-auto items-center">
          <Link to="/" className="flex items-center gap-1 font-semibold text-lg">
            <img src="/placeholder.svg" alt="Logo" className="w-8 h-8" />
            <span>ملابس أطفال وحريمي</span>
          </Link>

          {/* Mobile Toggle Button */}
          <button 
            className="md:hidden p-1" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Navigation links */}
        <div className={`${isOpen ? "flex flex-col items-center mt-10 w-full" : "hidden md:flex"} gap-3 md:gap-4`}>
          <Link 
            to="/" 
            className={`flex items-center gap-1 px-2 py-1 rounded ${location.pathname === '/' ? 'bg-white text-green-900' : 'hover:bg-white/20'}`}
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>
          
          <Link 
            to="/contact" 
            className={`flex items-center gap-1 px-2 py-1 rounded ${location.pathname === '/contact' ? 'bg-white text-green-900' : 'hover:bg-white/20'}`}
          >
            <Phone className="w-4 h-4" />
            <span>اتصل بنا</span>
          </Link>
          
          {user && !isOnAdminPages && !isMobile && (
            <Link 
              to="/profile" 
              className={`flex items-center gap-1 px-2 py-1 rounded ${isOnProfilePage ? 'bg-white text-green-900' : 'hover:bg-white/20'}`}
            >
              <User className="w-4 h-4" />
              <span>حسابي</span>
            </Link>
          )}
          
          {user && !isOnAdminPages && !isMobile && (
            <Link 
              to="/cart" 
              className={`flex items-center gap-1 px-2 py-1 rounded ${location.pathname === '/cart' ? 'bg-white text-green-900' : 'hover:bg-white/20'} relative`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>العربة</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className={`${isOpen ? "flex flex-col mt-8 w-full" : "hidden md:flex"} gap-2`}>
          {!user ? (
            <>
              <Link to="/login">
                <Button className="bg-white text-green-900 hover:bg-gray-100 text-sm px-3 py-1 h-auto flex items-center gap-1">
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-white/20 hover:bg-white/30 text-sm px-3 py-1 h-auto flex items-center gap-1">
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء حساب</span>
                </Button>
              </Link>
              {/* Admin login button - now only shown in mobile menu, not in main navigation */}
              {isOpen && (
                <Link to="/admin-login">
                  <Button className="bg-green-800 hover:bg-green-700 text-sm px-3 py-1 h-auto mt-2">
                    <span>Admin</span>
                  </Button>
                </Link>
              )}
            </>
          ) : (
            // Mobile-only user menu items
            isMobile && !isOnAdminPages && (
              <>
                <Link to="/profile">
                  <Button className="bg-white text-green-900 hover:bg-gray-100 text-sm w-full">
                    <User className="w-4 h-4 mr-1" />
                    <span>حسابي</span>
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button className="bg-white/20 hover:bg-white/30 text-sm w-full relative">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    <span>العربة</span>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
