
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/RequireAuth";

// Add framer-motion for page transitions
const queryClient = new QueryClient();

// Animated page transitions wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="w-full h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/profile" 
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            } 
          />
          <Route 
            path="/cart" 
            element={
              <RequireAuth>
                <Cart />
              </RequireAuth>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <RequireAuth adminOnly={true}>
                <Admin />
              </RequireAuth>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
