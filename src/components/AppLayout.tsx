
import React from 'react';
import Layout from './Layout';
import useAppInit from '@/hooks/use-app-init';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Initialize app-wide features and compatibility fixes
  useAppInit();
  
  return <Layout>{children}</Layout>;
};

export default AppLayout;
