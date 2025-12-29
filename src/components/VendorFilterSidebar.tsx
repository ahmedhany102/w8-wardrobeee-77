import React from 'react';
import { useVendors } from '@/hooks/useVendors';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Store } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface VendorFilterSidebarProps {
  selectedVendorIds: string[];
  onVendorChange: (vendorIds: string[]) => void;
}

const VendorFilterSidebar: React.FC<VendorFilterSidebarProps> = ({
  selectedVendorIds,
  onVendorChange
}) => {
  const { vendors, loading } = useVendors();

  const handleVendorToggle = (vendorId: string) => {
    if (selectedVendorIds.includes(vendorId)) {
      onVendorChange(selectedVendorIds.filter(id => id !== vendorId));
    } else {
      onVendorChange([...selectedVendorIds, vendorId]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">البائع</h3>
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (vendors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Store className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">البائع</h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="flex items-center gap-2">
            <Checkbox
              id={`vendor-${vendor.id}`}
              checked={selectedVendorIds.includes(vendor.id)}
              onCheckedChange={() => handleVendorToggle(vendor.id)}
            />
            <Label
              htmlFor={`vendor-${vendor.id}`}
              className="text-sm text-foreground cursor-pointer flex-1 flex items-center justify-between"
            >
              <span>{vendor.name}</span>
              <span className="text-muted-foreground text-xs">
                ({vendor.product_count})
              </span>
            </Label>
          </div>
        ))}
      </div>

      {selectedVendorIds.length > 0 && (
        <button
          onClick={() => onVendorChange([])}
          className="text-sm text-primary hover:underline"
        >
          مسح الكل
        </button>
      )}
    </div>
  );
};

export default VendorFilterSidebar;
