
import React, { useState, useEffect, useMemo } from "react";
import { Product } from "@/models/Product";
import { useProductVariants } from "@/hooks/useProductVariants";
import ProductColorSwatch from "./ProductColorSwatch";
import ProductSizeButton from "./ProductSizeButton";

// For the product details page to allow selecting and updating variants (color, size)
interface ProductVariantSelectorProps {
  product: Product;
  onVariantChange?: (color: string, size: string, price: number, stock: number, image: string) => void;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({ product, onVariantChange }) => {
  const { variants, fetchVariants } = useProductVariants(product.id);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    fetchVariants();
    // eslint-disable-next-line
  }, [product.id]);

  // Compute unique colors (preserve insert order in DB)
  const colorOptions = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants]
  );
  // Get image for each color (first variant per color)
  const colorImages = useMemo(
    () =>
      colorOptions.reduce<{ [color: string]: string }>((acc, color) => {
        const variant = variants.find((v) => v.color === color);
        acc[color] = variant?.image_url || "/placeholder.svg";
        return acc;
      }, {}),
    [variants, colorOptions]
  );
  // When color changes, show only available sizes for it
  const sizeOptions = useMemo(
    () =>
      selectedColor
        ? variants
            .filter((v) => v.color === selectedColor)
            .map((v) => ({ size: v.size, stock: v.stock, price: v.price }))
        : [],
    [variants, selectedColor]
  );
  // Get the variant matching color/size
  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ),
    [variants, selectedColor, selectedSize]
  );

  // Default select color/size if not set
  useEffect(() => {
    if (!selectedColor && colorOptions.length) {
      setSelectedColor(colorOptions[0]);
    }
  }, [colorOptions, selectedColor]);
  useEffect(() => {
    if (
      selectedColor &&
      (!selectedSize ||
        !sizeOptions.find((s) => s.size === selectedSize && s.stock > 0))
    ) {
      // Auto-select first in-stock size for selected color
      const firstAvailable = sizeOptions.find((s) => s.stock > 0);
      if (firstAvailable) setSelectedSize(firstAvailable.size);
      else setSelectedSize("");
    }
    // eslint-disable-next-line
  }, [selectedColor, sizeOptions.length]);

  // Trigger callback with exact selection
  useEffect(() => {
    if (
      selectedColor &&
      selectedSize &&
      selectedVariant &&
      onVariantChange
    ) {
      onVariantChange(
        selectedColor,
        selectedSize,
        selectedVariant.price,
        selectedVariant.stock,
        selectedVariant.image_url
      );
    }
    // eslint-disable-next-line
  }, [selectedColor, selectedSize, selectedVariant]);

  return (
    <div className="space-y-3">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={
            selectedVariant?.image_url ||
            (selectedColor ? colorImages[selectedColor] : product.main_image) ||
            "/placeholder.svg"
          }
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Color Swatches */}
      <div>
        <span className="block text-xs text-gray-600 mb-1">اللون:</span>
        <div className="flex gap-2 flex-wrap">
          {colorOptions.map((color) => (
            <ProductColorSwatch
              key={color}
              color={color}
              selected={color === selectedColor}
              label={color}
              onSelect={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      {/* Size Buttons */}
      <div>
        <span className="block text-xs text-gray-600 mb-1">المقاس:</span>
        <div className="flex gap-2 flex-wrap">
          {sizeOptions.length === 0 ? (
            <span className="text-xs text-gray-400">غير متوفر لهذا اللون</span>
          ) : (
            sizeOptions.map(({ size, stock }) => (
              <ProductSizeButton
                key={size}
                size={size}
                selected={size === selectedSize}
                disabled={stock <= 0}
                onSelect={() => setSelectedSize(size)}
              />
            ))
          )}
        </div>
      </div>

      {/* Price & Stock */}
      <div className="flex items-center gap-3 mt-2">
        {selectedVariant && (
          <>
            <span className="text-green-700 font-bold">
              {selectedVariant.price.toFixed(0)} جنيه
            </span>
            <span
              className={`text-xs font-semibold ${
                selectedVariant.stock > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {selectedVariant.stock > 0 ? "متوفر" : "غير متوفر"}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductVariantSelector;
