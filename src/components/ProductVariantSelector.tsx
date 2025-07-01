
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Product } from '@/models/Product';
import { useProductVariants } from "@/hooks/useProductVariants";

interface ProductVariantSelectorProps {
  product: Product;
  onVariantChange?: (selectedColor: string, selectedSize: string, price: number, stock: number) => void;
}

const ProductVariantSelector = ({ product, onVariantChange }: ProductVariantSelectorProps) => {
  const { variants, fetchVariants, loading } = useProductVariants(product.id);
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");

  useEffect(() => { 
    fetchVariants(); 
  }, [product.id]);

  const colorList = useMemo(() => variants, [variants]);

  const optionList = useMemo(() => {
    const cur = colorList.find(c => c.id === selectedColorId);
    return cur?.options || [];
  }, [colorList, selectedColorId]);

  // Auto-select first available options
  useEffect(() => {
    if (!loading && colorList.length) {
      if (!selectedColorId || !colorList.some(c => c.id === selectedColorId)) {
        const firstColor = colorList[0];
        setSelectedColorId(firstColor.id);
        setSelectedOptionId("");
      }
    }
  }, [colorList, selectedColorId, loading]);

  useEffect(() => {
    if (selectedColorId && optionList.length && (!selectedOptionId || !optionList.some(o => o.id === selectedOptionId))) {
      const availableOption = optionList.find(o => o.stock > 0) || optionList[0];
      if (availableOption) {
        setSelectedOptionId(availableOption.id!);
      }
    }
  }, [selectedColorId, optionList, selectedOptionId]);

  const selectedColorVariant = colorList.find(c => c.id === selectedColorId);
  const selectedOption = optionList.find(o => o.id === selectedOptionId);

  // Notify parent of selection changes
  useEffect(() => {
    if (selectedColorVariant && selectedOption && onVariantChange) {
      onVariantChange(
        selectedColorVariant.color, 
        selectedOption.size, 
        selectedOption.price,
        selectedOption.stock
      );
    }
  }, [selectedColorVariant, selectedOption, onVariantChange]);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-800 mx-auto mb-2"></div>
        جاري تحميل الخيارات...
      </div>
    );
  }

  if (colorList.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        لا توجد خيارات متاحة لهذا المنتج
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main product image OR selected color variant image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
        <img
          src={selectedColorVariant?.image || product.main_image || product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      </div>

      {/* Color selection */}
      <div className="space-y-3">
        <h3 className="font-medium text-lg">اللون المتاح</h3>
        <div className="flex flex-wrap gap-2">
          {colorList.map((colorVar) => (
            <Button
              key={colorVar.id}
              variant={colorVar.id === selectedColorId ? "default" : "outline"}
              onClick={() => {
                setSelectedColorId(colorVar.id);
                setSelectedOptionId("");
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                colorVar.id === selectedColorId 
                ? "bg-green-600 text-white border-green-600" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {colorVar.color}
            </Button>
          ))}
        </div>
      </div>

      {/* Size selection */}
      <div className="space-y-3">
        <h3 className="font-medium text-lg">المقاس المتاح</h3>
        <div className="flex flex-wrap gap-2">
          {optionList.map((option) => {
            const isAvailable = option.stock > 0;
            const isSelected = option.id === selectedOptionId;
            
            return (
              <Button
                key={option.id}
                variant={isSelected ? "default" : "outline"}
                onClick={() => isAvailable && setSelectedOptionId(option.id!)}
                disabled={!isAvailable}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isSelected 
                  ? "bg-green-600 text-white border-green-600"
                  : isAvailable
                  ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                }`}
              >
                <div className="text-center">
                  <div className="font-medium">{option.size}</div>
                  <div className="text-xs">
                    {isAvailable ? `${option.stock} متوفر` : "نفذ"}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        
        {optionList.length === 0 && (
          <p className="text-gray-500 text-sm">لا توجد مقاسات متاحة لهذا اللون</p>
        )}
      </div>

      {/* Price and stock display */}
      {selectedColorVariant && selectedOption && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-xl text-green-700">
                {selectedOption.price} جنيه
              </span>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${
                selectedOption.stock > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {selectedOption.stock > 0 
                  ? `متوفر (${selectedOption.stock} قطعة)`
                  : "غير متوفر"
                }
              </div>
              <div className="text-xs text-gray-500 mt-1">
                اللون: {selectedColorVariant.color} | المقاس: {selectedOption.size}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
