import React from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

interface VendorBadgeProps {
  vendorName: string;
  vendorSlug: string;
  className?: string;
}

const VendorBadge: React.FC<VendorBadgeProps> = ({ 
  vendorName, 
  vendorSlug,
  className = ''
}) => {
  return (
    <Link
      to={`/store/${vendorSlug}`}
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Store className="w-3 h-3" />
      <span>بواسطة: {vendorName}</span>
    </Link>
  );
};

export default VendorBadge;
