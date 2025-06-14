
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from '@/models/Product';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import CartDatabase from "@/models/CartDatabase";

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
  
  // Get the default image - handle both arrays and strings
  const mainImage =
    (product.mainImage && product.mainImage !== "" ? product.mainImage : null) ||
    (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ||
    "/placeholder.svg";
  
  // Safe calculation for out of stock - ensure sizes is an array
  const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
  const isOutOfStock = productSizes.length === 0 || productSizes.every(s => !s || s.stock <= 0);
  
  // Safe calculation for minimum price
  const minPrice = productSizes.length > 0 
    ? Math.min(...productSizes.filter(s => s && s.stock > 0).map(s => s.price || product.price || 0)) 
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

    try {
      // Get the first available size if product has sizes
      let size = "";
      let color = "";
      
      if (productSizes.length > 0) {
        const availableSize = productSizes.find(s => s && s.stock > 0);
        if (availableSize) {
          size = availableSize.size;
        }
      }

      // Get default color if available
      if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
        color = product.colors[0];
      }

      // Add to cart using CartDatabase singleton instance
      const cartDb = CartDatabase.getInstance();
      await cartDb.addToCart(product, size, color, 1);

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

        {/* Available colors */}
        {product.colors && Array.isArray(product.colors) && product.colors.length > 1 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-600">الألوان:</span>
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Available sizes */}
        {productSizes.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-600">المقاسات:</span>
            <div className="flex gap-1 flex-wrap">
              {productSizes.slice(0, 4).map((sizeInfo, index) => (
                <span
                  key={index}
                  className={`text-xs px-1 py-0.5 rounded border ${
                    sizeInfo.stock > 0 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  {sizeInfo.size}
                </span>
              ))}
              {productSizes.length > 4 && (
                <span className="text-xs text-gray-500">+{productSizes.length - 4}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <Button
          onClick={handleQuickAddToCart}
          disabled={isOutOfStock}
          className={`w-full text-sm ${
            isOutOfStock 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? 'غير متوفر' : 'أضف للسلة'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
