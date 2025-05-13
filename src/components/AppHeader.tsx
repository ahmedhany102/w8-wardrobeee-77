
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainNavigation from './MainNavigation';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="w-full mb-6">
      <div className="container px-4 py-4 mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-green-800 dark:text-green-400">
              W8
            </Link>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome, {user.name}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, Guest
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
