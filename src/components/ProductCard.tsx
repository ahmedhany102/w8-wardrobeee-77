import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from '@/models/Product';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from 'sonner';

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

  const availableSizes = (product.sizes || []).filter(s => s && s.stock > 0);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]?.size || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [showDetails, setShowDetails] = useState(false);
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
          onClick={() => {
            onAddToCart(product, selectedSize, 1);
            toast.success('تم إضافة المنتج للعربة!');
          }}
          className="w-full bg-green-600 hover:bg-green-700 transition-colors"
          disabled={availableSizes.length === 0}
        >
          {availableSizes.length === 0 ? 'غير متوفر' : 'أضف للعربة'}
        </Button>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
          onClick={() => setShowDetails(true)}
        >
          عرض التفاصيل
        </Button>
      </CardFooter>
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 left-2 text-red-600 font-bold text-2xl" onClick={() => setShowDetails(false)}>×</button>
            <h2 className="text-xl font-bold mb-2">{product?.name || "منتج بدون اسم"}</h2>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {(product.images && product.images.length > 0 ? product.images : [mainImage]).map((img, idx) => (
                <img key={idx} src={img} alt={product.name} className="h-28 w-28 object-cover rounded border" />
              ))}
            </div>
            <div className="mb-2">
              <span className="font-bold">القسم:</span> {product.category} <span className="font-bold ml-2">النوع:</span> {product.type}
            </div>
            <div className="mb-2">
              <span className="font-bold">تفاصيل:</span> {product.details}
            </div>
            {product.colors && product.colors.length > 0 && (
              <div className="mb-3">
                <label className="block font-bold mb-1">اختر اللون:</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center focus:outline-none ${selectedColor === color ? 'ring-2 ring-green-600 border-green-600' : 'border-gray-300'}`}
                      style={{ background: colorMap[color] || color, color: color === 'أبيض' ? '#111' : '#fff' }}
                      title={color}
                      onClick={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && <span className="text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {availableSizes.length > 0 && (
              <div className="mb-3">
                <label className="block font-bold mb-1">اختر المقاس:</label>
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
            <Button
              className="w-full bg-green-600 hover:bg-green-700 mt-4"
              disabled={!selectedSize || !selectedColor}
              onClick={() => {
                onAddToCart(product, selectedSize, 1);
                toast.success('تم إضافة المنتج للعربة!');
                setShowDetails(false);
              }}
            >
              أضف للعربة
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductCard;
