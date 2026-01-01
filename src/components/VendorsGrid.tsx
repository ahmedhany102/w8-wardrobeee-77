import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendors } from '@/hooks/useVendors';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, ArrowLeft } from 'lucide-react';

const VendorsGrid: React.FC = () => {
  const { vendors, loading } = useVendors();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {vendors.map((vendor) => (
        <div
          key={vendor.id}
          className="relative"
          onClick={() => navigate(`/store/${vendor.slug}`)}
        >
          {/* ===== LOGO (OUTSIDE CARD – NO CROPPING) ===== */}
          <div className="absolute -top-6 right-4 z-30">
            <div className="w-16 h-16 rounded-full bg-white border shadow-md flex items-center justify-center">
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

          {/* ===== CARD ===== */}
          <Card className="pt-6 cursor-pointer hover:shadow-lg transition">
            {/* Cover */}
            <div className="h-24 w-full rounded-t-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/10">
              {vendor.cover_url && (
                <img
                  src={vendor.cover_url}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Content */}
            <CardContent className="pt-8 pb-4 text-right">
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                {vendor.name}
              </h3>

              <p className="text-xs text-muted-foreground mb-3">
                {vendor.product_count ?? 0} منتج
              </p>

              <Button
                size="sm"
                variant="outline"
                className="w-full flex items-center justify-center gap-1 text-xs"
              >
                زيارة المتجر
                <ArrowLeft className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default VendorsGrid;
