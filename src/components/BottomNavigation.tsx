
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User, Package, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CartDatabase from "@/models/CartDatabase";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Check if we're on admin pages
  const isOnAdminPages = location.pathname.startsWith('/admin');

  // Update cart count
  useEffect(() => {
    console.log("BottomNavigation mounted");
    
    const updateCartCount = async () => {
      try {
        const cartDb = await CartDatabase.getInstance();
        const cartItems = await cartDb.getCartItems();
        setCartItemCount(cartItems.length);
        console.log("Cart items updated:", cartItems.length);
      } catch (error) {
        console.error("Error updating cart count:", error);
      }
    };

    updateCartCount();

    // Listen for cart updates
    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Don't show bottom navigation on admin pages
  if (isOnAdminPages) {
    console.log("On admin page - hiding bottom navigation");
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
      <div className="flex justify-between items-center">
        <Link 
          to="/" 
          className={`flex flex-1 flex-col items-center py-3 ${
            location.pathname === '/' ? 'text-green-700' : 'text-gray-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">الرئيسية</span>
        </Link>
        
        <Link 
          to="/cart" 
          className={`flex flex-1 flex-col items-center py-3 relative ${
            location.pathname === '/cart' ? 'text-green-700' : 'text-gray-500'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartItemCount > 0 && (
            <span className="absolute top-0 right-[30%] bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
              {cartItemCount}
            </span>
          )}
          <span className="text-xs">العربة</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-1 flex-col items-center py-3 ${
            location.pathname === '/profile' ? 'text-green-700' : 'text-gray-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs">حسابي</span>
        </Link>
        
        <Link 
          to="/orders" 
          className={`flex flex-1 flex-col items-center py-3 ${
            location.pathname.includes('/orders') ? 'text-green-700' : 'text-gray-500'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-xs">طلباتي</span>
        </Link>
        
        <Link 
          to="/order-tracking" 
          className={`flex flex-1 flex-col items-center py-3 ${
            location.pathname === '/order-tracking' ? 'text-green-700' : 'text-gray-500'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-xs">التتبع</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
