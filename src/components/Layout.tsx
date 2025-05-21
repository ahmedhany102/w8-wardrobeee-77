
import React from 'react';
import { useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import Footer from './Footer';
import CustomFooter from './CustomFooter';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout = ({ children, hideFooter = false }: LayoutProps) => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow pb-16 md:pb-0">{children}</main>
      {!hideFooter && (isAdminPage ? <Footer /> : <CustomFooter />)}
    </div>
  );
};

export default Layout;
