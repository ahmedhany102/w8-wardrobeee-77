import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, Package, User, Heart, Home, Tag, Search } from 'lucide-react';

interface MainNavigationProps {
  showProtectedRoutes?: boolean;
  position?: 'top' | 'bottom';
}

const MainNavigation: React.FC<MainNavigationProps> = ({ 
  showProtectedRoutes = true,
  position = 'bottom' 
}) => {
  // Don't render if position is top
  if (position === 'top') {
    return null;
  }

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `flex flex-col items-center text-xs py-1 px-3 rounded-md transition-colors ${
      isActive
        ? 'text-white bg-green-700'
        : 'text-gray-300 hover:text-white hover:bg-green-800/50'
    }`;
  };

  // Public routes (visible to all users)
  const publicRoutes = [
    { to: '/', text: 'Home', icon: <Home className="h-4 w-4" /> },
    { to: '/contact', text: 'Contact', icon: <Search className="h-4 w-4" /> },
  ];

  // Protected routes (visible only to authenticated users)
  const protectedRoutes = [
    { to: '/profile', text: 'Profile', icon: <User className="h-4 w-4" /> },
    { to: '/cart', text: 'Cart', icon: <ShoppingCart className="h-4 w-4" /> },
    { to: '/orders', text: 'Orders', icon: <Package className="h-4 w-4" /> },
    { to: '/tracking', text: 'Track', icon: <Package className="h-4 w-4" /> },
  ];

  // Combine routes based on user authentication status
  const routes = [...publicRoutes, ...(showProtectedRoutes ? protectedRoutes : [])];

  return (
    <nav className="flex justify-center md:justify-start overflow-x-auto hide-scrollbar">
      <ul className="flex space-x-1">
        {routes.map((route) => (
          <li key={route.to}>
            <NavLink to={route.to} className={getNavLinkClass} end>
              {route.icon}
              <span>{route.text}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MainNavigation;
