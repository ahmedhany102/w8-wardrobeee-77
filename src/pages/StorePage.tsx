import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useVendorBySlug, useVendorProducts } from '@/hooks/useVendors';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, Search, Package, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

const StorePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const { vendor, loading: vendorLoading, error: vendorError } = useVendorBySlug(slug || '');
  const { products, loading: productsLoading } = useVendorProducts(slug || '', activeSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  // Loading state
  if (vendorLoading) {
    return (
      <Layout>
        <div className="w-full">
          <Skeleton className="w-full h-48 md:h-64" />
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 -mt-12 relative z-10">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error or not found state
  if (vendorError || !vendor) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Store className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">المتجر غير موجود</h1>
          <p className="text-muted-foreground">عذراً، لم نتمكن من العثور على هذا المتجر</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        {/* Cover Banner */}
        <div className="w-full h-48 md:h-64 bg-gradient-to-l from-primary/20 to-primary/40 relative overflow-hidden">
          {vendor.cover_url ? (
            <img
              src={vendor.cover_url}
              alt={`${vendor.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-l from-primary/30 to-primary/60" />
          )}
        </div>

        {/* Store Header */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12 relative z-10 mb-8">
            {/* Store Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-lg bg-card flex items-center justify-center">
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1 pt-4 md:pt-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {vendor.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Package className="w-4 h-4" />
                <span>{products.length} منتج</span>
              </div>
            </div>
          </div>

          {/* Search Bar - Vendor Scoped */}
          <form onSubmit={handleSearch} className="mb-8 max-w-xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder={`ابحث في ${vendor.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                بحث
              </Button>
            </div>
            {activeSearch && (
              <p className="text-sm text-muted-foreground mt-2">
                نتائج البحث عن: "{activeSearch}"
              </p>
            )}
          </form>

          {/* Products Grid */}
          <div className="pb-8">
            {productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  {activeSearch ? 'لا توجد نتائج للبحث' : 'لا توجد منتجات في هذا المتجر حالياً'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StorePage;
