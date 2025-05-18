import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from '@/models/Product';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string, quantity?: number) => void;
  className?: string;
}

const ProductCard = ({ product, onAddToCart, className = '' }: ProductCardProps) => {
  if (!product || typeof product !== "object") return null;

  const availableSizes = (product.sizes || []).filter(s => s && s.stock > 0);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]?.size || '');
  const minPrice = availableSizes.length > 0 ? Math.min(...availableSizes.map(s => s.price)) : null;
  const mainImage =
    (product.mainImage && product.mainImage !== "" ? product.mainImage : null) ||
    (product.images && product.images[0]) ||
    "/placeholder.svg";

  return (
    <Card className={`hover:shadow-lg transition-all overflow-hidden animate-fade-in ${className}`}>
      <CardHeader className="p-0">
        <div className="relative">
          <AspectRatio ratio={4/3} className="bg-gray-100 min-h-[180px]">
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
          </AspectRatio>
          {product.hasDiscount && product.discount && product.discount > 0 && (
            <div className="absolute top-0 right-0 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-20">
              عرض خاص: خصم {product.discount}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{product?.name || "منتج بدون اسم"}</h3>
        <p className="text-gray-500 text-sm truncate">{product?.category || "-"} - {product?.type || "-"}</p>
        {product.details && <p className="text-xs text-gray-600 mt-1 truncate">{product.details}</p>}
        {product.colors && product.colors.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">الألوان: {product.colors.join(', ')}</div>
        )}
        <div className="mt-2">
          {minPrice !== null ? (
            <span className="text-lg font-bold text-green-700">{minPrice} EGP</span>
          ) : (
            <span className="text-lg font-bold text-gray-400">غير متوفر</span>
          )}
        </div>
        {availableSizes.length > 0 && (
          <div className="mt-2">
            <label className="block text-xs mb-1">اختر المقاس:</label>
            <select
              value={selectedSize}
              onChange={e => setSelectedSize(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              {availableSizes.map(size => (
                <option key={size.size} value={size.size}>
                  {size.size} - {size.price} EGP {size.stock === 0 ? '(غير متوفر)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <Button 
          onClick={() => onAddToCart(product, selectedSize, 1)}
          className="w-full bg-green-600 hover:bg-green-700 transition-colors"
          disabled={availableSizes.length === 0}
        >
          {availableSizes.length === 0 ? 'غير متوفر' : 'أضف للعربة'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
