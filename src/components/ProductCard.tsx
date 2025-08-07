
import React, { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from '@/models/Product';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { toast } from 'sonner';
import CartDatabase from "@/models/CartDatabase";
import { useProductVariants } from '@/hooks/useProductVariants';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, size: string, quantity?: number) => void;
  className?: string;
}

const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  if (!product || typeof product !== "object") {
    console.warn('⚠️ Invalid product passed to ProductCard:', product);
    return null;
  }

  const navigate = useNavigate();
  const { variants, fetchVariants } = useProductVariants(product.id);
  
  useEffect(() => {
    fetchVariants();
  }, [product.id]);

  // Get the default image - handle both arrays and strings
  const mainImage =
    product.main_image || product.image_url ||
    (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ||
    "/placeholder.svg";
  
  // Calculate stock from variants (CORRECTED LOGIC)
  const getTotalStock = () => {
    if (variants.length === 0) {
      // Fallback to legacy stock for products without variants
      return product.inventory || product.stock || 0;
    }
    return variants.reduce((total, variant) => {
      if (!variant.options) return total;
      return total + variant.options.reduce((variantTotal, option) => 
        variantTotal + (option.stock || 0), 0);
    }, 0);
  };

  const totalStock = getTotalStock();
  const isOutOfStock = totalStock === 0;
  
  // Get minimum price from variants or fallback to product price
  const minPrice = variants.length > 0 
    ? Math.min(...variants.flatMap(v => v.options?.map(o => o.price) || []))
    : (product.price || 0);

  // Calculate original price if there is a discount
  const originalPrice = product.hasDiscount && product.discount 
    ? minPrice * (100 / (100 - product.discount)) 
    : minPrice;

  // Quick add to cart handler with enhanced error handling
  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't allow adding if out of stock
    if (isOutOfStock) {
      toast.error("المنتج غير متوفر حالياً");
      return;
    }

    // If product has variants, redirect to details page for selection
    if (variants.length > 0) {
      navigate(`/product/${product.id}`);
      return;
    }

    try {
      // Simple product without variants
      const cartDb = CartDatabase.getInstance();
      await cartDb.addToCart(product, 'واحد', '', 1);
      toast.success("تم إضافة المنتج إلى السلة");
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("فشل في إضافة المنتج إلى السلة");
    }
  };

  // Handle product click to view details
  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-green-300 border-gray-200 ${className}`}
      onClick={handleProductClick}
    >
      <CardHeader className="p-0 pb-2">
        <AspectRatio ratio={1} className="bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </AspectRatio>
        
        {/* Discount badge */}
        {product.hasDiscount && product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discount}%
          </div>
        )}
        
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
            <span className="text-white font-bold text-lg">غير متوفر</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 pb-2">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>
        
        {/* Price section */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-green-700">
            {minPrice.toFixed(0)} جنيه
          </span>
          {product.hasDiscount && product.discount && originalPrice > minPrice && (
            <span className="text-sm text-gray-500 line-through">
              {originalPrice.toFixed(0)} جنيه
            </span>
          )}
        </div>

        {/* Available colors from variants */}
        {variants.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-600">الألوان:</span>
            <div className="flex gap-1">
              {variants.slice(0, 3).map((variant, index) => (
                <div
                  key={variant.id}
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: getColorHex(variant.color) }}
                  title={variant.color}
                />
              ))}
              {variants.length > 3 && (
                <span className="text-xs text-gray-500">+{variants.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Stock Badge */}
        <div className="mb-2">
          {isOutOfStock ? (
            <Badge variant="destructive" className="text-xs">نفذت الكمية</Badge>
          ) : totalStock <= 5 ? (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">كمية محدودة</Badge>
          ) : (
            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">متوفر</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <div className="flex gap-2">
          <Button
            onClick={handleProductClick}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            عرض
          </Button>
          <Button
            onClick={handleQuickAddToCart}
            disabled={isOutOfStock}
            size="sm"
            className={`flex-1 text-xs ${
              isOutOfStock 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {isOutOfStock ? 'نفذت' : variants.length > 0 ? 'اختيار' : 'أضف'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Color mapping helper
const getColorHex = (color: string) => {
  const colorMap: Record<string, string> = {
    'أحمر': '#ff0000',
    'أزرق': '#0074D9',
    'أسود': '#111111',
    'أبيض': '#ffffff',
    'أخضر': '#2ECC40',
    'أصفر': '#FFDC00',
    'رمادي': '#AAAAAA',
    'وردي': '#FF69B4',
    'بنفسجي': '#B10DC9',
    'بني': '#8B4513',
  };
  return colorMap[color] || '#cccccc';
};

export default ProductCard;
