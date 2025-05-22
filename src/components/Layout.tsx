import React from 'react';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Don't show certain elements to admin users
  const showContent = !user || !isAdmin;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto px-4 py-8 flex-grow">
        {showContent ? (
          children
        ) : (
          <div className="text-center mt-20">
            <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
            <p>You are logged in as an administrator. Some features are disabled.</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go to Homepage
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
