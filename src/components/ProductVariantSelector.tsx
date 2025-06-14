
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from '@/models/Product';

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

const ProductVariantSelector = ({ 
  product, 
  onVariantChange, 
  selectedColor: initialColor,
  selectedSize: initialSize 
}: ProductVariantSelectorProps) => {
  const [selectedColor, setSelectedColor] = useState<string>(initialColor || "");
  const [selectedSize, setSelectedSize] = useState<string>(initialSize || "");
  const [mainImage, setMainImage] = useState<string>(product.main_image || "");
  const [availableSizes, setAvailableSizes] = useState<Array<{size: string; price: number; stock: number}>>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(product.price || 0);

  // Parse color variants from product data
  const colorVariants: ColorVariant[] = React.useMemo(() => {
    if (!product.colors || !Array.isArray(product.colors) || product.colors.length === 0) {
      // Simple product without color variations
      return [{
        color: "default",
        image: product.main_image || "",
        sizes: Array.isArray(product.sizes) ? product.sizes : []
      }];
    }

    // Product with color variations
    return product.colors.map(color => {
      // Find color-specific image
      let colorImage = product.main_image || "";
      
      // Try to find color-specific image from images array
      if (product.images && Array.isArray(product.images)) {
        const colorSpecificImage = product.images.find(img => 
          img.toLowerCase().includes(color.toLowerCase())
        );
        if (colorSpecificImage) {
          colorImage = colorSpecificImage;
        }
      }

      return {
        color,
        image: colorImage,
        sizes: Array.isArray(product.sizes) ? product.sizes : []
      };
    });
  }, [product]);

  // Initialize default selections
  useEffect(() => {
    if (colorVariants.length > 0) {
      const firstVariant = colorVariants[0];
      
      if (!selectedColor) {
        setSelectedColor(firstVariant.color);
        setMainImage(firstVariant.image);
        setAvailableSizes(firstVariant.sizes);
      }
      
      if (!selectedSize && firstVariant.sizes.length > 0) {
        const firstAvailableSize = firstVariant.sizes.find(s => s.stock > 0);
        if (firstAvailableSize) {
          setSelectedSize(firstAvailableSize.size);
          setCurrentPrice(firstAvailableSize.price);
        }
      }
    }
  }, [colorVariants, selectedColor, selectedSize]);

  // Handle color selection
  const handleColorSelect = (color: string) => {
    const variant = colorVariants.find(v => v.color === color);
    if (!variant) return;

    setSelectedColor(color);
    setMainImage(variant.image);
    setAvailableSizes(variant.sizes);
    
    // Reset size selection and update price
    const firstAvailableSize = variant.sizes.find(s => s.stock > 0);
    if (firstAvailableSize) {
      setSelectedSize(firstAvailableSize.size);
      setCurrentPrice(firstAvailableSize.price);
      
      if (onVariantChange) {
        onVariantChange(color, firstAvailableSize.size, firstAvailableSize.price);
      }
    } else {
      setSelectedSize("");
      setCurrentPrice(variant.sizes[0]?.price || product.price || 0);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    const sizeInfo = availableSizes.find(s => s.size === size);
    if (!sizeInfo) return;

    setSelectedSize(size);
    setCurrentPrice(sizeInfo.price);
    
    if (onVariantChange) {
      onVariantChange(selectedColor, size, sizeInfo.price);
    }
  };

  // Check if current selection is in stock
  const isInStock = () => {
    const sizeInfo = availableSizes.find(s => s.size === selectedSize);
    return sizeInfo ? sizeInfo.stock > 0 : false;
  };

  const hasColorVariations = colorVariants.length > 1 || colorVariants[0]?.color !== "default";

  return (
    <div className="space-y-6">
      {/* Main Product Image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <img 
          src={mainImage || "/placeholder.svg"} 
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>

      {/* Color Selection */}
      {hasColorVariations && (
        <div className="space-y-3">
          <h3 className="font-medium text-lg">اللون</h3>
          <div className="flex flex-wrap gap-2">
            {colorVariants.map((variant) => (
              <Button
                key={variant.color}
                variant={selectedColor === variant.color ? "default" : "outline"}
                onClick={() => handleColorSelect(variant.color)}
                className="relative"
              >
                {variant.color === "default" ? "اللون الأساسي" : variant.color}
                {variant.image && variant.image !== product.main_image && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-lg">المقاس</h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((sizeInfo) => (
              <Button
                key={sizeInfo.size}
                variant={selectedSize === sizeInfo.size ? "default" : "outline"}
                onClick={() => handleSizeSelect(sizeInfo.size)}
                disabled={sizeInfo.stock <= 0}
                className="relative"
              >
                {sizeInfo.size}
                {sizeInfo.stock <= 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                    نفذ
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-green-700">
            {currentPrice.toFixed(2)} EGP
          </span>
          {product.discount && product.discount > 0 && (
            <span className="text-lg text-gray-400 line-through">
              {(currentPrice * (100 / (100 - product.discount))).toFixed(2)} EGP
            </span>
          )}
        </div>
        
        {selectedSize && (
          <div className="text-sm text-gray-600">
            {isInStock() ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                متوفر
              </Badge>
            ) : (
              <Badge variant="destructive">
                غير متوفر
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariantSelector;
