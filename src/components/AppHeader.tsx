
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './ui/button';
import { LogOut, Shield, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

const AppHeader = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if currently on an admin page
  const isAdminPage = location.pathname.includes('/admin');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleAdminLogout = () => {
    logout();
    toast.success('Logged out from admin panel');
    navigate('/admin-login');
  };

  return (
    <header className="w-full bg-gradient-to-r from-green-900 to-black sticky top-0 z-40 shadow-md">
      <div className="container px-4 py-2 mx-auto">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            {isAdminPage ? (
              <Link to="/admin" className="text-xl font-bold text-white flex items-center">
                <Shield className="mr-2" /> Admin Panel
              </Link>
            ) : (
              <Link to="/" className="text-xl font-bold text-white">
                W8
              </Link>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 p-0 text-white hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-300">
                    {user.name} {isAdmin && "(Admin)"}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={isAdminPage ? handleAdminLogout : handleLogout}
                    className="flex items-center gap-1 bg-transparent border-gray-600 text-white hover:bg-gray-800"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs">Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-300 mr-2">
                    Welcome, Guest
                  </div>
                  <Link to="/login" className="text-sm text-white hover:text-green-300 mr-2">
                    Login
                  </Link>
                  <Link to="/admin-login" className="flex items-center text-sm text-white hover:text-green-300">
                    <Shield className="h-3.5 w-3.5 mr-1" />
                    Admin
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
