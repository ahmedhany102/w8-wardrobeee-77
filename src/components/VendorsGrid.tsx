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
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-3" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16 mb-3" />
                <Skeleton className="h-8 w-full" />
              </div>
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
          className="overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
          onClick={() => navigate(`/store/${vendor.slug}`)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              {/* Vendor Logo */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                {vendor.logo_url ? (
                  <img 
                    src={vendor.logo_url} 
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-6 h-6 text-primary" />
                )}
              </div>
              
              {/* Vendor Name */}
              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {vendor.name}
              </h3>
              
              {/* Product Count */}
              {typeof vendor.product_count === 'number' && (
                <p className="text-xs text-muted-foreground mb-3">
                  {vendor.product_count} منتج
                </p>
              )}
              
              {/* Visit Store Button */}
              <Button 
                size="sm"
                className="w-full gap-1 text-xs group-hover:gap-2 transition-all"
                variant="outline"
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
