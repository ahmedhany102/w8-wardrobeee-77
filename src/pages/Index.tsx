
import React from 'react';
import Layout from '@/components/Layout';
import ProductCatalog from '@/components/ProductCatalog';
import AdCarousel from '@/components/AdCarousel';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/ui/loader';

const Index = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader size="lg" color="primary" className="mb-4" />
            <p className="text-green-800 font-medium">Loading...</p>
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
