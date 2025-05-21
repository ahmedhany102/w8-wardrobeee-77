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
  if (!product || typeof product !== "object") return null;

  const navigate = useNavigate();
  
  // Get the default image
  const mainImage =
    (product.mainImage && product.mainImage !== "" ? product.mainImage : null) ||
    (product.images && product.images[0]) ||
    "/placeholder.svg";
  
  // Calculate if product is out of stock
  const isOutOfStock = !product.sizes || product.sizes.every(s => !s || s.stock <= 0);
  
  // Calculate minimum price from all available sizes
  const minPrice = product.sizes && product.sizes.length > 0 
    ? Math.min(...product.sizes.filter(s => s && s.stock > 0).map(s => s.price)) 
    : (product.price || 0);

  // Quick add to cart handler
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
      if (product.sizes && product.sizes.length > 0) {
        const availableSize = product.sizes.find(s => s && s.stock > 0);
        if (availableSize) {
          size = availableSize.size;
        }
      }
      
      // Add to cart
      const cartDb = await CartDatabase.getInstance();
      await cartDb.addToCart({
        productId: product.id,
        name: product.name,
        price: minPrice,
        quantity: 1,
        size: size,
        color: product.colors && product.colors.length > 0 ? product.colors[0] : undefined,
        imageUrl: mainImage
      });
      
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
                {product.discount}%
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
          {product?.categoryPath ? product.categoryPath.join(" > ") : (product?.category || "-")}
        </p>
        <div className="mt-1">
          {minPrice > 0 ? (
            <span className="text-xs font-bold text-green-700">{minPrice} EGP</span>
          ) : (
            <span className="text-xs font-bold text-gray-400">غير متوفر</span>
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
