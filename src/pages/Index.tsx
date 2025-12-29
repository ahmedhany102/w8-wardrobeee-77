
import React from 'react';
import Layout from '@/components/Layout';
import ProductCatalog from '@/components/ProductCatalog';
import AdCarousel from '@/components/AdCarousel';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/ui/loader';

const Index = () => {
  const { user, loading } = useAuth();

  // Show loading state while maintaining layout to prevent CLS
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          {/* Reserve space for AdCarousel */}
          <div className="h-48 mb-6 flex items-center justify-center">
            <Loader size="lg" color="primary" className="mb-4" />
          </div>
          
          {/* Reserve space for greeting section */}
          <div className="mb-6 h-16"></div>

          {/* Reserve space for product catalog title */}
          <div className="h-8 mb-6"></div>
          
          {/* Reserve space for ProductCatalog content */}
          <div className="container mx-auto px-4 py-4">
            {/* ProductCatalogHeader space */}
            <div className="flex justify-between items-center mb-6 h-12"></div>
            
            {/* SearchBar space */}
            <div className="mb-6 h-12"></div>
            
            {/* ProductGrid loading space - reserve space for typical product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {/* Reserve space for 8 product cards to prevent shift */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Ad Carousel - At the very top */}
        <AdCarousel />
        
        {/* Greeting Section */}
        {user && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">أهلاً بك {user.name}!</h2>
            <p className="text-muted-foreground">نتمنى لك تجربة تسوق ممتعة</p>
          </div>
        )}

        {/* Product Catalog */}
        <h2 className="text-2xl font-bold text-foreground mb-6">منتجاتنا المميزة</h2>
        <ProductCatalog />
      </div>
    </Layout>
  );
};

export default Index;
