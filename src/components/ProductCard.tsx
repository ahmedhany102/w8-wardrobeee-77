
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
      
      // Get the first available color or empty string
      const productColors = Array.isArray(product.colors) ? product.colors : [];
      if (productColors.length > 0) {
        color = productColors[0];
      }
      
      // Add to cart - fixing by passing all required arguments: product, size, color, quantity
      const cartDb = await CartDatabase.getInstance();
      await cartDb.addToCart(product, size, color, 1);
      
      toast.success("تمت إضافة المنتج إلى سلة التسوق");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("حدث خطأ أثناء إضافة المنتج إلى سلة التسوق");
    }
  };
  
  return (
    <Card className={`hover:shadow-lg transition-all overflow-hidden animate-fade-in ${className} h-full`}>
      <CardHeader className="p-0">
        <div className="relative cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
          <AspectRatio ratio={1/1} className="bg-gray-100 min-h-[100px]">
            <img 
              src={mainImage}
              alt={product?.name || "منتج"}
              className="object-cover w-full h-full"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            {product.hasDiscount && product.discount && product.discount > 0 && (
              <span className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded shadow-lg z-10">
                خصم {product.discount}%
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded shadow-lg z-10">
                غير متوفر
              </span>
            )}
          </AspectRatio>
        </div>
      </CardHeader>
      <CardContent className="p-1 sm:p-2">
        <h3 className="font-medium truncate text-xs cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
          {product?.name || "منتج بدون اسم"}
        </h3>
        <p className="text-gray-500 text-xs truncate">
          {product?.categoryPath && Array.isArray(product.categoryPath) ? 
            product.categoryPath.join(" > ") : 
            (product?.category || product?.type || "-")}
        </p>
        {/* Show description if available */}
        {product.description && (
          <p className="text-gray-600 text-xs truncate mt-1">
            {product.description}
          </p>
        )}
        <div className="mt-1">
          {product.hasDiscount && product.discount && product.discount > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-green-700">{minPrice.toFixed(2)} EGP</span>
              <span className="text-xs text-gray-400 line-through">{originalPrice.toFixed(2)} EGP</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-green-700">{minPrice.toFixed(2)} EGP</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-1 sm:p-2 flex flex-col gap-2">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-xs py-0.5 h-6"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          عرض التفاصيل
        </Button>
        <Button
          className="w-full bg-green-600 hover:bg-green-700 transition-colors text-xs py-0.5 h-6 flex items-center justify-center gap-1"
          onClick={handleQuickAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="w-3 h-3" />
          <span>إضافة للعربة</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
