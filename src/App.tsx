
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';

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
import Offers from './pages/Offers';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import './autoScroll.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    // Ensure QueryClientProvider wraps the entire app
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/offers" element={<Offers />} />

                {/* Protected routes */}
                <Route element={<RequireAuth adminOnly={false} />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/tracking" element={<OrderTracking />} />
                  <Route path="/orders" element={<OrderTracking />} />
                </Route>

                {/* Admin routes - Notice we're not using Layout here */}
                <Route element={<RequireAuth adminOnly={true} />}>
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/products" element={<Admin activeTab="products" />} />
                  <Route path="/admin/orders" element={<Admin activeTab="orders" />} />
                  <Route path="/admin/users" element={<Admin activeTab="users" />} />
                  <Route path="/admin/offers" element={<Admin activeTab="offers" />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <SonnerToaster position="top-right" richColors closeButton />
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
