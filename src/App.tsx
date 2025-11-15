import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppHeader from './components/AppHeader';
import RequireAuth from './components/RequireAuth';
import Loader from './components/ui/loader';
import BottomNavigation from './components/BottomNavigation';
import { useMobile } from './hooks/use-mobile';
import './App.css'; // Import global styles if any

// =======================
//
//  ✅  الإصلاح:
//  قم باستيراد مكتبة react-query
//
// =======================
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Lazy load pages for better performance
const IndexPage = lazy(() => import('./pages/Index'));
const LoginPage = lazy(() => import('./pages/Login'));
const SignupPage = lazy(() => import('./pages/Signup'));
const CartPage = lazy(() => import('./pages/Cart'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetails'));
const AdminPage = lazy(() => import('./pages/Admin'));
const AdminLoginPage = lazy(() => import('./pages/AdminLogin'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ContactPage = lazy(() => import('./pages/Contact'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTracking'));
const TermsPage = lazy(() => import('./pages/Terms'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

// =======================
//
//  ✅  الإصلاح:
//  قم بإنشاء client (من الكود القديم)
//
// =======================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});


function App() {
  const isMobile = useMobile();

  return (
    // =======================
    //
    //  ✅  الإصلاح:
    //  قم بإحاطة كل شيء بـ QueryClientProvider
    //
    // =======================
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <AppHeader />
              <div className="flex-grow">
                {/* === التعديل هنا: شيلنا py-4 من الكلاس === */}
                <main className="container mx-auto">
                  <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader /></div>}>
                    <Routes>
                      <Route path="/" element={<IndexPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                      <Route path="/product/:id" element={<ProductDetailsPage />} />
                      
                      {/* تأكد من استخدام "adminOnly"
                        وليس "adminRequired"
                      */}
                      <Route path="/admin" element={<RequireAuth adminOnly={true}><AdminPage /></RequireAuth>} />
                      
                      <Route path="/admin/login" element={<AdminLoginPage />} />
                      <Route path="/category/:categoryName" element={<CategoryPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/track-order" element={<OrderTrackingPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
              {isMobile && <BottomNavigation />} {/* Show BottomNav only on mobile */}
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
