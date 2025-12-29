import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useVendors } from '@/hooks/useVendors';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Stores: React.FC = () => {
  const { vendors, loading, error } = useVendors();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            المتاجر
          </h1>
          <p className="text-muted-foreground text-lg">
            اكتشف متاجرنا المميزة وتسوق من البائعين الموثوقين
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center">
                  <Skeleton className="w-24 h-24 rounded-full mb-4" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-20 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-destructive text-lg">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && vendors.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">لا توجد متاجر حالياً</p>
          </div>
        )}

        {/* Vendors Grid */}
        {!loading && !error && vendors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <Card 
                key={vendor.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card"
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  {/* Vendor Logo */}
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-md mb-4 bg-muted flex items-center justify-center">
                    {vendor.logo_url ? (
                      <img
                        src={vendor.logo_url}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>

                  {/* Vendor Name */}
                  <h3 className="font-bold text-lg text-foreground mb-1">
                    {vendor.name}
                  </h3>

                  {/* Product Count */}
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                    <Package className="w-4 h-4" />
                    <span>{vendor.product_count} منتج</span>
                  </div>

                  {/* Visit Store Button */}
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link to={`/store/${vendor.slug}`}>
                      زيارة المتجر
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Stores;
