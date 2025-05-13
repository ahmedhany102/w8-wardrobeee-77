
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { LogIn, UserRound } from 'lucide-react';

const MainNavigation = () => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const recordActivity = (action: string) => {
    // Record user activity for admin dashboard
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const newActivity = {
      id: `act-${Date.now()}`,
      description: `${user?.name || 'User'} ${action}`,
      timestamp: new Date().toISOString(),
      type: "user"
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 20); // Keep only last 20 activities
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
  };

  const handleLogout = () => {
    if (user) {
      recordActivity("logged out");
    }
    logout();
  };

  return (
    <NavigationMenu className="max-w-full w-full bg-green-900/90 dark:bg-green-900/50 shadow-md px-4 py-2 rounded-md backdrop-blur-sm">
      <NavigationMenuList className="w-full flex justify-between">
        <div className="flex items-center gap-2">
          <NavigationMenuItem>
            <Link to="/">
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), isActive('/') && "bg-green-800 text-white")}>
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          {user && (
            <>
              <NavigationMenuItem>
                <Link to="/cart">
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), isActive('/cart') && "bg-green-800 text-white")}>
                    Cart
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/tracking">
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), isActive('/tracking') && "bg-green-800 text-white")}>
                    Orders
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={isActive('/profile') ? "bg-green-800 text-white" : ""}>
                  <UserRound className="h-4 w-4 mr-1" />
                  {user.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[200px]">
                    <div className="text-sm">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-xs text-gray-500">Role: {user.role}</div>
                    </div>
                    <hr />
                    <Link to="/profile" className="block p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                      Your Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                        Admin Dashboard
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </>
          ) : (
            <>
              <NavigationMenuItem>
                <Link to="/login">
                  <Button variant="outline" className={cn("gap-2", isActive('/login') && "bg-green-800 text-white")}>
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/signup">
                  <Button variant="default" className={cn(isActive('/signup') && "bg-green-700")}>
                    Sign Up
                  </Button>
                </Link>
              </NavigationMenuItem>
            </>
          )}
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigation;
