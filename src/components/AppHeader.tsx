
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainNavigation from './MainNavigation';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if currently on an admin page
  const isAdminPage = location.pathname.includes('/admin');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="w-full bg-gradient-to-r from-green-900 to-black sticky top-0 z-40 shadow-md">
      <div className="container px-4 py-2 mx-auto">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-white">
              W8
            </Link>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-300">
                    {user.name}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
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
                  {!isAdminPage && (
                    <Link to="/admin-login" className="text-sm text-white hover:text-green-300">
                      Admin
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <MainNavigation />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
