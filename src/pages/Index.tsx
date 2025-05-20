
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProductCatalog from '@/components/ProductCatalog';
import AdCarousel from '@/components/AdCarousel';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Ad Carousel */}
        <div className="mb-8">
          <AdCarousel />
        </div>
        
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
