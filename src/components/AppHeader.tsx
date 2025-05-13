import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainNavigation from './MainNavigation';

const AppHeader = () => {
  const { user } = useAuth();

  return (
    <header className="w-full mb-6">
      <div className="container px-4 py-4 mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-green-800 dark:text-green-400">
              W8 Food
            </Link>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {user.name}
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
