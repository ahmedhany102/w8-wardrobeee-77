
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';
import AppLayout from './components/AppLayout';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import OrderTracking from './pages/OrderTracking';

const App: React.FC = () => {
  // Browser compatibility is handled in initialize-app.ts which is imported in main.tsx
  
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin activeTab="dashboard" />} />
        <Route path="/admin/products" element={<Admin activeTab="products" />} />
        <Route path="/admin/orders" element={<Admin activeTab="orders" />} />
        <Route path="/admin/coupons" element={<Admin activeTab="coupons" />} />
        <Route path="/admin/contact" element={<Admin activeTab="contact" />} />
        <Route path="/admin/ads" element={<Admin activeTab="ads" />} />
        <Route path="/admin/users" element={<Admin activeTab="users" />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/order/:id" element={<OrderTracking />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
