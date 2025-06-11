
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
import ProductDetails from './pages/ProductDetails';
import Terms from './pages/Terms';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import './autoScroll.css';
import BottomNavigation from './components/BottomNavigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <Router>
          <AuthProvider>
            <div className="flex flex-col min-h-screen w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/product/:id" element={<ProductDetails />} />

                {/* Protected routes */}
                <Route element={<RequireAuth adminOnly={false} />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-tracking" element={<OrderTracking />} />
                  <Route path="/orders" element={<OrderTracking />} />
                </Route>

                {/* Admin routes */}
                <Route element={<RequireAuth adminOnly={true} />}>
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/products" element={<Admin />} />
                  <Route path="/admin/orders" element={<Admin />} />
                  <Route path="/admin/users" element={<Admin />} />
                  <Route path="/admin/coupons" element={<Admin />} />
                  <Route path="/admin/contact" element={<Admin />} />
                  <Route path="/admin/ads" element={<Admin />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <BottomNavigation />
            <SonnerToaster position="top-right" richColors closeButton />
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
