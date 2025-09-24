
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

          {/* Reserve space for product catalog header */}
          <div className="h-8 mb-6"></div>
          
          {/* Loading content */}
          <div className="text-center py-8">
            <p className="text-green-800 font-medium">Loading products...</p>
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
            <h2 className="text-xl font-bold mb-2">أهلاً بك {user.name}!</h2>
            <p className="text-gray-600">نتمنى لك تجربة تسوق ممتعة</p>
          </div>
        )}

        {/* Product Catalog */}
        <h2 className="text-2xl font-bold mb-6">تصفح منتجاتنا</h2>
        <ProductCatalog />
      </div>
    </Layout>
  );
};

export default Index;
