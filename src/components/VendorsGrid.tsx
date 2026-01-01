import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendors } from '@/hooks/useVendors';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, ArrowLeft } from 'lucide-react';

const VendorsGrid: React.FC = () => {
  const { vendors, loading, error } = useVendors();
  const navigate = useNavigate();

  /* ================= Loading ================= */
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex flex-col items-center">
              <Skeleton className="w-full h-24 rounded-md mb-6" />
              <Skeleton className="w-16 h-16 rounded-full mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16 mb-3" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  /* ================= Error ================= */
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">حدث خطأ أثناء تحميل المتاجر</p>
      </div>
    );
  }

  /* ================= Empty ================= */
  if (!vendors || vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold mb-1">لا توجد متاجر حالياً</h3>
        <p className="text-muted-foreground text-sm">
          سيتم إضافة متاجر جديدة قريباً
        </p>
      </div>
    );
  }

  /* ================= Grid ================= */
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {vendors.map((vendor) => (
        <Card
          key={vendor.id}
          className="relative hover:shadow-lg transition-all duration-300 cursor-pointer group"
          onClick={() => navigate(`/store/${vendor.slug}`)}
        >
          {/* ================= Cover ================= */}
          <div className="relative h-24 w-full rounded-t-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/10">
            {vendor.cover_url ? (
              <img
                src={vendor.cover_url}
                alt={`${vendor.name} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5" />
            )}
          </div>

          {/* ================= Logo (FIXED – NOT CROPPED) ================= */}
          <div className="absolute top-16 right-4 z-20">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-background shadow-md flex items-center justify-center">
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt={vendor.name}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Store className="w-6 h-6 text-primary" />
              )}
            </div>
          </div>

          {/* ================= Content ================= */}
          <CardContent className="pt-10 pb-4 px-3 text-right">
            {/* Vendor Name */}
            <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {vendor.name}
            </h3>

            {/* Product Count */}
            <p className="text-xs text-muted-foreground mb-3">
              {typeof vendor.product_count === 'number'
                ? `${vendor.product_count} منتج`
                : '0 منتج'}
            </p>

            {/* Visit Store */}
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs flex items-center justify-center gap-1 group-hover:gap-2 transition-all"
            >
              <span>زيارة المتجر</span>
              <ArrowLeft className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VendorsGrid;
