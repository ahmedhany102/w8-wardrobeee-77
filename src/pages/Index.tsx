
import React from 'react';
import Layout from '@/components/Layout';
import ProductCatalog from '@/components/ProductCatalog';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-12 md:py-16 rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-black opacity-90"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-fade-in">
              Welcome {user ? user.name : "to Our Shop"}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-100">
              Discover the best products in Egypt with our premium selection of food, technology, clothing, and shoes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in animation-delay-150">
              {!user ? (
                <>
                  <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-transparent border-2 border-green-400 text-white hover:bg-green-800 px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-transparent border-2 border-green-400 text-white hover:bg-green-800 px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                    <Link to="/admin-login">Admin</Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                  <a href="#products">Browse Products</a>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-10">
          <ProductCatalog />
        </section>
      </div>
    </Layout>
  );
};

export default Index;
