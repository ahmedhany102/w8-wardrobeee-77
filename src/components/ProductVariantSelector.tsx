import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from '@/models/Product';
import { useProductVariants } from "@/hooks/useProductVariants";

interface ProductVariantSelectorProps {
  product: Product;
  onVariantChange?: (selectedColor: string, selectedSize: string, price: number) => void;
  selectedColor?: string;
  selectedSize?: string;
}

interface ColorVariant {
  color: string;
  image: string;
  sizes: Array<{
    size: string;
    price: number;
    stock: number;
  }>;
}

const ProductVariantSelector = ({ product, onVariantChange, selectedColor: initialColor, selectedSize: initialSize }: ProductVariantSelectorProps) => {
  const [selectedColor, setSelectedColor] = useState<string>(initialColor || "");
  const [selectedSize, setSelectedSize] = useState<string>(initialSize || "");
  const [mainImage, setMainImage] = useState<string>(product.main_image || "");
  const [availableSizes, setAvailableSizes] = useState<Array<{size: string; price: number; stock: number}>>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(product.price || 0);
  const { variants, fetchVariants, loading } = useProductVariants(product.id);

  useEffect(() => { fetchVariants(); }, [product.id]);

  // Now instead of colorVariants, get unique colors/sizes from DB variants
  const colors = Array.from(new Set(variants.map(v => v.color)));
  const sizes = variants.filter(v => v.color === (selectedColor || colors[0])).map(v => v.size);

  // Find currently selected variant
  const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize)
    || variants[0];

  useEffect(() => {
    if (!selectedColor && colors.length) setSelectedColor(colors[0]);
    if (!selectedSize && sizes.length) setSelectedSize(sizes[0]);
  }, [colors, sizes, selectedColor, selectedSize]);

  return (
    <div className="space-y-6">
      {/* Main Product Image updates dynamically */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img 
          src={selectedVariant?.image_url || "/placeholder.svg"} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Color selection */}
      <div className="space-y-3">
        <h3 className="font-medium text-lg">اللون</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <Button key={color} variant={color === selectedColor ? "default" : "outline"}
              onClick={() => { setSelectedColor(color); setSelectedSize(""); }}>
              {color}
            </Button>
          ))}
        </div>
      </div>
      {/* Size selection */}
      <div className="space-y-3">
        <h3 className="font-medium text-lg">المقاس</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map(size => (
            <Button key={size} variant={size === selectedSize ? "default" : "outline"}
              onClick={() => setSelectedSize(size)}>
              {size}
            </Button>
          ))}
        </div>
      </div>
      {/* Price/stock display */}
      {selectedVariant && (
        <div>
          <div>
            <span className="font-bold text-green-700">{selectedVariant.price} EGP</span>
            <span className="ml-2">{selectedVariant.stock > 0 ? "متوفر" : "غير متوفر"}</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductVariantSelector;
