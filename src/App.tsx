
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';

import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';
import OrderTracking from './pages/OrderTracking';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected routes */}
              <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/tracking" element={<OrderTracking />} />
                <Route path="/orders" element={<OrderTracking />} />
              </Route>

              {/* Admin route */}
              <Route element={<RequireAuth requireAdmin={true} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>

          <SonnerToaster position="top-right" richColors closeButton />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
