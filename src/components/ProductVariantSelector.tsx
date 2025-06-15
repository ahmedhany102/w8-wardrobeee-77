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
  // Use new variant hook (color/option normalized model)
  const { variants, fetchVariants, loading } = useProductVariants(product.id);
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");

  // Refetch on mount or product.id change
  useEffect(() => { fetchVariants(); }, [product.id]);

  // List of color variants for the product
  const colorList = useMemo(() => variants, [variants]);

  // Options (sizes) for the selected color
  const optionList = useMemo(() => {
    const cur = colorList.find(c => c.id === selectedColorId);
    return cur?.options || [];
  }, [colorList, selectedColorId]);

  // Keep selection in bounds after loading
  useEffect(() => {
    if (!loading && colorList.length) {
      if (!selectedColorId || !colorList.some(c => c.id === selectedColorId)) {
        setSelectedColorId(colorList[0].id);
        setSelectedOptionId("");
      }
    }
  }, [colorList, selectedColorId, loading]);

  useEffect(() => {
    // When color changes, choose first available size for that color
    if (selectedColorId && optionList.length && (!selectedOptionId || !optionList.some(o => o.id === selectedOptionId))) {
      setSelectedOptionId(optionList[0].id);
    }
  }, [selectedColorId, optionList, selectedOptionId]);

  // Picked variant: ({color, image, option: {size, price, stock}})
  const selectedColorVariant = colorList.find(c => c.id === selectedColorId);
  const selectedOption = optionList.find(o => o.id === selectedOptionId);

  // Inform parent
  useEffect(() => {
    if (selectedColorVariant && selectedOption && onVariantChange)
      onVariantChange(selectedColorVariant.color, selectedOption.size, selectedOption.price);
  }, [selectedColorVariant, selectedOption, onVariantChange]);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">Loading options...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main product image OR selected color variant image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={selectedColorVariant?.image || product.main_image || product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Color swatches */}
      <div className="space-y-3">
        <h3 className="font-medium text-lg">اللون</h3>
        <div className="flex flex-wrap gap-2">
          {colorList.map((colorVar) => (
            <Button
              key={colorVar.id}
              variant={colorVar.id === selectedColorId ? "default" : "outline"}
              style={{
                backgroundColor: colorVar.color !== selectedColorVariant?.color ? colorVar.color : undefined,
                color: colorVar.color !== selectedColorVariant?.color ? "#fff" : undefined,
                borderColor: colorVar.id === selectedColorId ? "#166534" : "#e5e7eb"
              }}
              onClick={() => {
                setSelectedColorId(colorVar.id);
                setSelectedOptionId("");
              }}
              className="min-w-[2rem] px-4 py-2 rounded-full shadow border"
            >
              {colorVar.color}
            </Button>
          ))}
        </div>
      </div>
      {/* Size selection */}
      <div className="space-y-3">
        <h3 className="font-medium text-lg">المقاس</h3>
        <div className="flex flex-wrap gap-2">
          {optionList.map((option) => (
            <Button
              key={option.id}
              variant={option.id === selectedOptionId ? "default" : "outline"}
              onClick={() => setSelectedOptionId(option.id!)}
            >
              {option.size}
            </Button>
          ))}
        </div>
      </div>
      {/* Price and stock */}
      {selectedColorVariant && selectedOption && (
        <div>
          <div>
            <span className="font-bold text-green-700">
              {selectedOption.price} EGP
            </span>
            <span className="ml-2">
              {selectedOption.stock > 0 ? "متوفر" : "غير متوفر"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
