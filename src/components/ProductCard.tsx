
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product, SizeWithStock, ColorImage } from '@/models/Product';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string, quantity?: number) => void;
  className?: string;
}

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

const ProductCard = ({ product, onAddToCart, className = '' }: ProductCardProps) => {
  if (!product || typeof product !== "object") return null;

  const navigate = useNavigate();
  const availableSizes = (product.sizes || []).filter(s => s && s.stock > 0);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]?.size || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [currentImage, setCurrentImage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const minPrice = availableSizes.length > 0 ? Math.min(...availableSizes.map(s => s.price)) : null;
  
  // Get the default image
  const mainImage =
    (product.mainImage && product.mainImage !== "" ? product.mainImage : null) ||
    (product.images && product.images[0]) ||
    "/placeholder.svg";
  
  const isOutOfStock = availableSizes.length === 0;
  
  // Update current image when selected color changes
  useEffect(() => {
    if (product.colorImages && product.colorImages.length > 0 && selectedColor) {
      const colorImage = product.colorImages.find(ci => ci.color === selectedColor);
      if (colorImage) {
        setCurrentImage(colorImage.imageUrl);
        return;
      }
    }
    setCurrentImage(mainImage);
  }, [selectedColor, product.colorImages, mainImage]);

  return (
    <Card className={`hover:shadow-lg transition-all overflow-hidden animate-fade-in ${className}`}>
      <CardHeader className="p-0">
        <div className="relative">
          <AspectRatio ratio={4/3} className="bg-gray-100 min-h-[150px]">
            <img 
              src={currentImage || mainImage}
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
          {product.hasDiscount && product.discount && product.discount > 0 && (
            <div className="absolute top-0 right-0 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-20">
              عرض خاص: خصم {product.discount}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <h3 className="font-semibold truncate text-sm">{product?.name || "منتج بدون اسم"}</h3>
        <p className="text-gray-500 text-xs truncate">
          {product?.categoryPath ? product.categoryPath.join(" > ") : (product?.category || "-")} - {product?.type || "-"}
        </p>
        {product.details && <p className="text-xs text-gray-600 mt-1 truncate">{product.details}</p>}
        <div className="mt-2">
          {minPrice !== null ? (
            <span className="text-base font-bold text-green-700">{minPrice} EGP</span>
          ) : (
            <span className="text-base font-bold text-gray-400">غير متوفر</span>
          )}
        </div>
        
        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-2">
            <label className="block text-xs mb-1">اختر اللون:</label>
            <div className="flex flex-wrap gap-1">
              {product.colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border ${selectedColor === color ? 'ring-2 ring-green-600' : ''}`}
                  style={{ backgroundColor: colorMap[color] || '#ccc' }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Size Selection */}
        {availableSizes.length > 0 && (
          <div className="mt-2">
            <label className="block text-xs mb-1">اختر المقاس:</label>
            <select
              value={selectedSize}
              onChange={e => setSelectedSize(e.target.value)}
              className="border rounded px-2 py-1 w-full text-xs"
            >
              {availableSizes.map(size => (
                <option key={size.size} value={size.size}>
                  {size.size} - {size.price} EGP
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 flex flex-col gap-2">
        <Button 
          onClick={async () => {
            if (isOutOfStock) {
              toast.error('المنتج غير متوفر حالياً');
              return;
            }
            
            const CartDatabase = (await import('@/models/CartDatabase')).default;
            const cartDb = CartDatabase.getInstance();
            await cartDb.addToCart(product, selectedSize, selectedColor, 1);
            toast.success('تم إضافة المنتج للعربة!');
          }}
          className="w-full bg-green-600 hover:bg-green-700 transition-colors text-xs py-1"
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'غير متوفر' : 'أضف للعربة'}
        </Button>
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
