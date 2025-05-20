
import React from 'react';
import { useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import Footer from './Footer';
import CustomFooter from './CustomFooter';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow">{children}</main>
      {isAdminPage ? <Footer /> : <CustomFooter />}
    </div>
  );
};

export default Layout;
