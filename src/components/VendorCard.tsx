import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Package } from 'lucide-react';

interface VendorCardProps {
  vendor: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    product_count: number;
  };
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card">
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
  );
};

export default VendorCard;
