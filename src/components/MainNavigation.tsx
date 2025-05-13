import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const MainNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  // This component is now simplified since navigation is moved to bottom bar
  // We keep it minimal - it's essentially just a placeholder for potential future use
  return <></>;
};

export default MainNavigation;
