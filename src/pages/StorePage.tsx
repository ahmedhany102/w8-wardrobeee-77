import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useVendorBySlug, useVendorProducts, useVendorCategories } from '@/hooks/useVendors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { Store, Search, Package, ArrowRight, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { DynamicSections } from '@/components/sections';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StorePage = () => {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const navigate = useNavigate();
  const { vendor, loading: vendorLoading, error: vendorError } = useVendorBySlug(vendorSlug);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'products'>('home');
  
  const { products, loading: productsLoading } = useVendorProducts(
    vendor?.id,
    selectedCategory,
    searchQuery
  );
  const { categories } = useVendorCategories(vendor?.id);

  const handleAddToCart = async (product: any, size: string, quantity?: number) => {
    navigate(`/product/${product.id}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor?.name,
          text: `Check out ${vendor?.name}`,
          url: url
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Store link copied');
    }
  };

  if (vendorLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="w-full h-48 md:h-64 rounded-lg mb-6" />
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
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
          <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn't find this store
          </p>
          <Button onClick={() => navigate('/vendors')}>
            <ArrowRight className="w-4 h-4 ml-2" />
            Back to Stores
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 1. Store Cover (Banner) - Layer 0 */}
      <div className="relative z-0 w-full h-48 md:h-64 bg-gradient-to-br from-primary/30 to-primary/10 overflow-hidden">
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

        {/* Share Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
      
      {/* 2. Container (Holds Content) - Layer 10 */}
      <div className="relative z-10 container mx-auto px-4">
        
        {/* 3. Store Header */}
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4">
          
          {/* Vendor Logo */}
          <div className="shrink-0 w-28 h-28 rounded-full bg-background border-4 border-background shadow-lg flex items-center justify-center overflow-hidden z-20">
            {vendor.logo_url ? (
              <img 
                src={vendor.logo_url} 
                alt={vendor.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <Store className="w-12 h-12 text-primary" />
            )}
          </div>
          
          {/* Vendor Info */}
          <div className="text-center sm:text-right pb-2 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{vendor.name}</h1>
            {vendor.description && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{vendor.description}</p>
            )}
            <p className="text-muted-foreground text-sm mt-1">
              {products.length} products available
            </p>
          </div>
        </div>
        
        {/* Tab Navigation for Store */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="products">All Products</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="mt-6">
            {/* Dynamic Sections for Vendor Store */}
            <DynamicSections scope="vendor" vendorId={vendor.id} />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            {/* Store Controls Row */}
            <div className="mb-8 space-y-4">
              {/* Search Input */}
              <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={`Search in ${vendor.name}...`}
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
                    All
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
                    ? 'No matching products' 
                    : 'No products in this store'}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory 
                    ? 'Try changing your search criteria'
                    : 'Products will be added soon'}
                </p>
                {(searchQuery || selectedCategory) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                  >
                    Clear Filters
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StorePage;