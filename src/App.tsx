
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import ProductDetails from './pages/ProductDetails';
import OrderTracking from './pages/OrderTracking';
import RequireAuth from './components/RequireAuth';

/**
 * Function to ensure consistent behavior across different browsers
 * Call this on app startup to apply compatibility fixes
 */
export function ensureBrowserCompatibility() {
  // Register compatibility check on DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    console.log('Applying browser compatibility fixes...');
    
    // Fix for mobile responsive viewport
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const newViewportMeta = document.createElement('meta');
      newViewportMeta.name = 'viewport';
      newViewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(newViewportMeta);
    }
    
    // Test localStorage functionality
    try {
      localStorage.setItem('browserCheck', 'ok');
      localStorage.removeItem('browserCheck');
    } catch (error) {
      console.error('localStorage not available:', error);
      alert('This site requires local storage to work properly. Please enable cookies and local storage in your browser settings.');
    }
    
    // Force apply any saved contact settings to ensure footer consistency
    const savedSettings = localStorage.getItem('contactSettings');
    if (!savedSettings) {
      // If no settings found, add default contact settings
      const defaultSettings = {
        developerName: 'Ahmed Hany',
        developerUrl: 'https://ahmedhany.dev',
        facebook: 'https://www.facebook.com/share/16LEN8zQG3/',
        instagram: 'https://www.instagram.com/a7med._.hany/',
        linkedin: 'https://www.linkedin.com/in/ahmed-hany-436342257',
        whatsapp: 'https://wa.me/qr/2O2JSVLBTNEIJ1'
      };
      localStorage.setItem('contactSettings', JSON.stringify(defaultSettings));
    }

    console.log('Browser compatibility check completed');
  });
  
  // Add global data refresh events
  window.addEventListener('dataUpdated', (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.source) {
      console.log(`Refreshing data from ${customEvent.detail.source}...`);
      
      // Trigger appropriate refresh actions based on source
      switch (customEvent.detail.source) {
        case 'products':
          window.dispatchEvent(new Event('productsUpdated'));
          break;
        case 'cart':
          window.dispatchEvent(new Event('cartUpdated'));
          break;
        case 'homeAds':
          window.dispatchEvent(new Event('adsUpdated'));
          break;
        case 'contactSettings':
          // Force refresh page to apply new footer settings
          window.location.reload();
          break;
      }
    }
  });
}

// Call this function immediately to ensure browser compatibility
ensureBrowserCompatibility();

// Create the actual App component that returns JSX
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="cart" element={<Cart />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="products/:productId" element={<ProductDetails />} />
        <Route path="order-tracking" element={<OrderTracking />} />
        <Route path="profile" element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        } />
        <Route path="admin-login" element={<AdminLogin />} />
        <Route path="admin/*" element={
          <RequireAuth adminOnly>
            <Admin />
          </RequireAuth>
        } />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
