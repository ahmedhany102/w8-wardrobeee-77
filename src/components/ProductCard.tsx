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

  const availableSizes = (product.sizes || []).filter(s => s.stock > 0);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]?.size || '');
  const minPrice = availableSizes.length > 0 ? Math.min(...availableSizes.map(s => s.price)) : null;
  const mainImage =
    (product.mainImage && product.mainImage !== "" ? product.mainImage : null) ||
    (product.images && product.images[0]) ||
    "/placeholder.svg";
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className={`hover:shadow-lg transition-all overflow-hidden animate-fade-in ${className}`}>
      <CardHeader className="p-0">
        <div className="relative">
          <AspectRatio ratio={4 / 3} className="bg-gray-100 min-h-[180px]">
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
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate mb-1 text-center text-lg">{product?.name || "منتج بدون اسم"}</h3>
        <p className="text-gray-500 text-sm text-center mb-2">{product?.category || "-"} - {product?.type || "-"}</p>

        {product.details && <p className="text-xs text-gray-600 mt-1 truncate text-center">{product.details}</p>}

        {product.colors && product.colors.length > 0 && (
          <div className="text-xs text-gray-500 mt-1 text-center">الألوان: {product.colors.join(', ')}</div>
        )}

        <div className="mt-2 text-center">
          {minPrice !== null ? (
            <span className="text-lg font-bold text-green-700">{minPrice} EGP</span>
          ) : (
            <span className="text-lg font-bold text-gray-400">غير متوفر</span>
          )}
        </div>

        {availableSizes.length > 0 && (
          <div className="mt-3">
            <label className="block text-xs mb-1 text-center">اختر المقاس:</label>
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
        <Button
          onClick={() => setShowDetails(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          عرض التفاصيل
        </Button>
      </CardFooter>

      {showDetails && product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 left-2 text-red-600 font-bold text-2xl" onClick={() => setShowDetails(false)}>×</button>

            <h2 className="text-xl font-bold mb-4 text-center">{product?.name || "منتج بدون اسم"}</h2>
            <img
              src={mainImage}
              alt={product?.name || "منتج"}
              className="w-40 h-40 object-cover rounded mb-4 mx-auto"
              onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />

            <div className="mb-3 text-sm">
              <span className="font-semibold">القسم:</span> {product?.category || "-"} - {product?.type || "-"}
            </div>

            {product?.colors && product.colors.length > 0 ? (
              <div className="mb-3">
                <span className="font-semibold">الألوان المتوفرة:</span>
                <div className="flex gap-2 mt-1">
                  {product.colors.map(color => (
                    <span
                      key={color}
                      style={{ background: color }}
                      className="rounded-full w-6 h-6 border border-gray-400"
                      title={color}
                    ></span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-3 text-gray-400">لا توجد ألوان متوفرة</div>
            )}

            {product?.sizes && product.sizes.length > 0 ? (
              <div className="mb-3">
                <span className="font-semibold">المقاسات المتوفرة:</span>
                <table className="w-full text-sm mt-2 border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">المقاس</th>
                      <th className="p-2 border">السعر</th>
                      <th className="p-2 border">المخزون</th>
                      <th className="p-2 border">صورة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizes.map(size => (
                      <tr key={size.size}>
                        <td className="p-2 border text-center">{size.size}</td>
                        <td className="p-2 border text-center">{size.price} EGP</td>
                        <td className="p-2 border text-center">{size.stock}</td>
                        <td className="p-2 border text-center">
                          {size.image ? (
                            <img
                              src={size.image}
                              alt="size"
                              className="w-10 h-10 object-cover rounded mx-auto"
                              onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                            />
                          ) : (
                            'بدون صورة'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mb-3 text-gray-400">لا توجد مقاسات متوفرة</div>
            )}

            {product?.details ? (
              <div className="mb-3">
                <span className="font-semibold">تفاصيل إضافية:</span>
                <p className="text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap">
                  {product.details}
                </p>
              </div>
            ) : (
              <div className="mb-3 text-gray-400">لا توجد تفاصيل إضافية</div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductCard;
