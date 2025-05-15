
import React from 'react';
import AppHeader from './AppHeader';
import Footer from './Footer';
import { Home, ShoppingCart, Package2, Truck, User } from 'lucide-react';
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
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <main className={`flex-1 w-full ${!isAdminPage ? 'content-with-bottom-nav' : ''}`}>
        <div className="container mx-auto px-4 py-4">
          {children}
        </div>
      </main>
      <Footer />
      
      {!isAdminPage && user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-900 to-black z-50 border-t border-green-800 py-2">
          <div className="container mx-auto flex justify-around items-center">
            <NavItem to="/" icon={<Home size={20} />} label="Home" />
            {!isAdmin && <NavItem to="/cart" icon={<ShoppingCart size={20} />} label="Cart" />}
            {!isAdmin && <NavItem to="/orders" icon={<Package2 size={20} />} label="Orders" />}
            {!isAdmin && <NavItem to="/tracking" icon={<Truck size={20} />} label="Track" />}
            <NavItem to="/profile" icon={<User size={20} />} label="Profile" />
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
      className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors ${
        isActive 
          ? 'text-green-300' 
          : 'text-gray-300 hover:text-green-100'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
};

export default Layout;
