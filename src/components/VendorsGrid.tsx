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

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex flex-col items-center">
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">حدث خطأ أثناء تحميل المتاجر</p>
      </div>
    );
  }

  if (vendors.length === 0) {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {vendors.map((vendor) => (
        <Card
          key={vendor.id}
          className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
          onClick={() => navigate(`/store/${vendor.slug}`)}
        >
          {/* ================= Cover Image ================= */}
          <div className="relative h-24 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-secondary/10">
            {vendor.cover_url ? (
              <img
                src={vendor.cover_url}
                alt={`${vendor.name} cover`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />

            {/* ================= Vendor Logo ================= */}
            <div className="absolute -bottom-7 right-3 w-16 h-16 rounded-full bg-white border-2 border-background shadow-md flex items-center justify-center z-10">
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

          {/* ================= Card Content ================= */}
          <CardContent className="pt-10 pb-4 px-3">
            <div className="flex flex-col text-right">
              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {vendor.name}
              </h3>

              {typeof vendor.product_count === 'number' && (
                <p className="text-xs text-muted-foreground mb-3">
                  {vendor.product_count} منتج
                </p>
              )}

              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1 text-xs group-hover:gap-2 transition-all"
              >
                <span>زيارة المتجر</span>
                <ArrowLeft className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VendorsGrid;
