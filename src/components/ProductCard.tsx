
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from '@/models/Product';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string, quantity?: number) => void;
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

  return (
    <Card className={`hover:shadow-lg transition-all overflow-hidden animate-fade-in ${className}`}>
      <CardHeader className="p-0">
        <div className="relative">
          <AspectRatio ratio={4/3} className="bg-gray-100 min-h-[150px]">
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
              <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10 animate-bounce">
                خصم {product.discount}%
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
                غير متوفر
              </span>
            )}
          </AspectRatio>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <h3 className="font-semibold truncate text-sm">{product?.name || "منتج بدون اسم"}</h3>
        <p className="text-gray-500 text-xs truncate">
          {product?.categoryPath ? product.categoryPath.join(" > ") : (product?.category || "-")}
        </p>
        {product.details && <p className="text-xs text-gray-600 mt-1 truncate">{product.details}</p>}
        <div className="mt-2">
          {minPrice > 0 ? (
            <span className="text-base font-bold text-green-700">{minPrice} EGP</span>
          ) : (
            <span className="text-base font-bold text-gray-400">غير متوفر</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-xs py-1"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          عرض التفاصيل
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
