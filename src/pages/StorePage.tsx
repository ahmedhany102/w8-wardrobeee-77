import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useVendorBySlug, useVendorProducts, useVendorCategories } from '@/hooks/useVendors';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { Store, Search, Package, ArrowRight } from 'lucide-react';

const StorePage = () => {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const navigate = useNavigate();
  const { vendor, loading: vendorLoading, error: vendorError } = useVendorBySlug(vendorSlug);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { products, loading: productsLoading } = useVendorProducts(
    vendor?.id,
    selectedCategory,
    searchQuery
  );
  const { categories } = useVendorCategories(vendor?.id);

  // Handle add to cart - this would need to be integrated with your cart system
  const handleAddToCart = async (product: any, size: string, quantity?: number) => {
    // Navigate to product details for full selection
    navigate(`/product/${product.id}`);
  };

  if (vendorLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          {/* Cover Skeleton */}
          <Skeleton className="w-full h-48 md:h-64 rounded-lg mb-6" />
          
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (vendorError || !vendor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">المتجر غير موجود</h1>
          <p className="text-muted-foreground mb-6">
            عذراً، لم نتمكن من العثور على هذا المتجر
          </p>
          <Button onClick={() => navigate('/vendors')}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمتاجر
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Store Cover */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-br from-primary/30 to-primary/10 overflow-hidden">
        {vendor.cover_url ? (
          <img 
            src={vendor.cover_url} 
            alt={`${vendor.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4">
        {/* Store Header - Overlapping the cover */}
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4">
          {/* Vendor Logo */}
          <div className="w-28 h-28 rounded-full bg-card border-4 border-background shadow-lg flex items-center justify-center overflow-hidden">
            {vendor.logo_url ? (
              <img 
                src={vendor.logo_url} 
                alt={vendor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-12 h-12 text-primary" />
            )}
          </div>
          
          {/* Vendor Info */}
          <div className="text-center sm:text-right pb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{vendor.name}</h1>
            <p className="text-muted-foreground">
              {products.length} منتج متاح
            </p>
          </div>
        </div>
        
        {/* Store Controls Row */}
        <div className="mb-8 space-y-4">
          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`ابحث داخل متجر ${vendor.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          
          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                <Package className="w-4 h-4 ml-1" />
                الكل
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">
              {searchQuery || selectedCategory 
                ? 'لا توجد منتجات مطابقة' 
                : 'لا توجد منتجات في هذا المتجر'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory 
                ? 'جرب تغيير معايير البحث'
                : 'سيتم إضافة منتجات قريباً'}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
              >
                إزالة الفلاتر
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 pb-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StorePage;
