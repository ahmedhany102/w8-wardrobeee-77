import React from 'react';
import AppHeader from './AppHeader';
import Footer from './Footer';
import { Home, ShoppingCart, Package2, Truck, User, Tag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  
  // Don't show bottom nav in admin pages
  const isAdminPage = location.pathname.includes('/admin');
  const isLoginPage = location.pathname.includes('/login') || location.pathname.includes('/signup');
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <main className={`flex-1 w-full ${user && !isAdminPage ? 'pb-24' : ''}`}>
        <div className="container mx-auto px-4 py-4">
          {children}
        </div>
      </main>
      <Footer />
      {/* Bottom nav ثابت في الأسفل */}
      {user && !isAdminPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-900 to-black z-40 border-t border-green-800 py-1">
          <div className="container mx-auto flex justify-around items-center">
            <NavItem to="/" icon={<Home size={18} />} label="Home" />
            {!isAdmin && <NavItem to="/cart" icon={<ShoppingCart size={18} />} label="Cart" />}
            {!isAdmin && <NavItem to="/orders" icon={<Package2 size={18} />} label="Orders" />}
            {!isAdmin && <NavItem to="/tracking" icon={<Truck size={18} />} label="Track" />}
            <NavItem to="/profile" icon={<User size={18} />} label="Profile" />
          </div>
        </nav>
      )}
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to}
      className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors ${
        isActive 
          ? 'text-green-300' 
          : 'text-gray-300 hover:text-green-100'
      }`}
    >
      {icon}
      <span className="text-xs mt-0.5">{label}</span>
    </Link>
  );
};

export default Layout;
