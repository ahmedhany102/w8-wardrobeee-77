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

  const handleAddToCart = async (product: any, size: string, quantity?: number) => {
    navigate(`/product/${product.id}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor?.name,
          text: `تفقد متجر ${vendor?.name}`,
          url: url
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ رابط المتجر');
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
      {/* Hero Banner Section */}
      <div className="relative w-full h-56 md:h-72 lg:h-80 overflow-hidden">
        {/* Cover Image */}
        {vendor.cover_url ? (
          <img 
            src={vendor.cover_url} 
            alt={`${vendor.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/20 to-secondary/30" />
        )}
        
        {/* Dark Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

        {/* Hero Content - Centered on banner */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {/* Logo */}
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border-4 border-white/30 shadow-2xl flex items-center justify-center overflow-hidden mb-4">
            {vendor.logo_url ? (
              <img 
                src={vendor.logo_url} 
                alt={vendor.name}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <Store className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            )}
          </div>
          
          {/* Store Name */}
          <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
            {vendor.name}
          </h1>
          
          {/* Description */}
          {vendor.description && (
            <p className="text-white/80 text-sm md:text-base max-w-xl line-clamp-2 drop-shadow mb-2">
              {vendor.description}
            </p>
          )}
          
          {/* Product Count Badge */}
          <div className="bg-white/20 backdrop-blur-sm text-white text-xs md:text-sm px-4 py-1.5 rounded-full">
            {products.length} منتج متاح
          </div>
        </div>

        {/* Share Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        
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
