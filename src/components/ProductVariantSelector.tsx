
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Product } from '@/models/Product';
import { useProductVariants } from "@/hooks/useProductVariants";

// Props for the product variant selector
interface ProductVariantSelectorProps {
  product: Product;
  onVariantChange?: (selectedColor: string, selectedSize: string, price: number) => void;
}

const ProductVariantSelector = ({ product, onVariantChange }: ProductVariantSelectorProps) => {
  const { variants, fetchVariants, loading } = useProductVariants(product.id);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  // Get all unique colors (from variants)
  const colorList = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants]
  );

  // When color changes, get all sizes available for that color
  const sizeList = useMemo(
    () => variants.filter((v) => v.color === selectedColor).map((v) => v.size),
    [variants, selectedColor]
  );

  // Pick current variant for selected color/size
  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ),
    [variants, selectedColor, selectedSize]
  );

  // When variants load, or a color is picked, update selection
  useEffect(() => {
    if (!loading && colorList.length) {
      // Default color if not set
      if (!selectedColor || !colorList.includes(selectedColor)) {
        setSelectedColor(colorList[0]);
        setSelectedSize("");
      }
    }
  }, [colorList, selectedColor, loading]);

  useEffect(() => {
    // When color changes, choose first available size for that color
    if (selectedColor && sizeList.length && (!selectedSize || !sizeList.includes(selectedSize))) {
      setSelectedSize(sizeList[0]);
    }
  }, [selectedColor, sizeList, selectedSize]);

  // Inform parent on selection change
  useEffect(() => {
    if (selectedVariant && onVariantChange)
      onVariantChange(selectedVariant.color, selectedVariant.size, selectedVariant.price);
  }, [selectedVariant, onVariantChange]);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">Loading options...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main product image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={selectedVariant?.image_url || product.main_image || product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Color swatches */}
      <div className="space-y-3">
        <h3 className="font-medium text-lg">اللون</h3>
        <div className="flex flex-wrap gap-2">
          {colorList.map((color) => (
            <Button
              key={color}
              variant={color === selectedColor ? "default" : "outline"}
              style={{
                backgroundColor: color !== selectedColor ? color : undefined,
                // Show color as swatch if not selected, otherwise use green highlight
                color: color !== selectedColor ? "#fff" : undefined,
                borderColor: color === selectedColor ? "#166534" : "#e5e7eb"
              }}
              onClick={() => {
                setSelectedColor(color);
                setSelectedSize("");
              }}
              className="min-w-[2rem] px-4 py-2 rounded-full shadow border"
            >
              {color}
            </Button>
          ))}
        </div>
      </div>
      {/* Size selection */}
      <div className="space-y-3">
        <h3 className="font-medium text-lg">المقاس</h3>
        <div className="flex flex-wrap gap-2">
          {sizeList.map((size) => (
            <Button
              key={size}
              variant={size === selectedSize ? "default" : "outline"}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>
      {/* Price and stock */}
      {selectedVariant && (
        <div>
          <div>
            <span className="font-bold text-green-700">
              {selectedVariant.price} EGP
            </span>
            <span className="ml-2">
              {selectedVariant.stock > 0 ? "متوفر" : "غير متوفر"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
