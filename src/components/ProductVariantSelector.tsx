import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useProductVariants, ProductVariant } from '@/hooks/useProductVariants';
import { Product } from '@/models/Product';

interface ProductVariantSelectorProps {
  product: Product;
  onVariantChange?: (selectedVariant: ProductVariant | null, price: number, stock: number) => void;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  onVariantChange
}) => {
  const { variants, loading, fetchVariants } = useProductVariants(product.id);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    fetchVariants();
  }, [product.id]);

  useEffect(() => {
    // Auto-select default variant or first variant from both new variants and legacy data
    const allVariants = variants.length > 0 ? variants : (
      product.colors && product.images && product.colors.length > 0 && product.images.length > 0
        ? product.colors.map((color, index) => ({
            id: `legacy-${color}-${index}`,
            product_id: product.id,
            label: color,
            image_url: product.images![index] || product.images![0],
            hex_code: undefined,
            price_adjustment: 0,
            stock: product.stock || 0,
            is_default: index === 0,
            position: index,
          }))
        : []
    );
    
    if (allVariants.length > 0 && !selectedVariantId) {
      const defaultVariant = allVariants.find(v => v.is_default) || allVariants[0];
      setSelectedVariantId(defaultVariant.id);
    }
  }, [variants, selectedVariantId, product.colors, product.images, product.id, product.stock]);

  useEffect(() => {
    // Create combined variant list for selection logic
    const allVariants = variants.length > 0 ? variants : (
      product.colors && product.images && product.colors.length > 0 && product.images.length > 0
        ? product.colors.map((color, index) => ({
            id: `legacy-${color}-${index}`,
            product_id: product.id,
            label: color,
            image_url: product.images![index] || product.images![0],
            hex_code: undefined,
            price_adjustment: 0,
            stock: product.stock || 0,
            is_default: index === 0,
            position: index,
          }))
        : []
    );
    
    const selectedVariant = allVariants.find(v => v.id === selectedVariantId);
    if (selectedVariant && onVariantChange) {
      const finalPrice = (product.price || 0) + selectedVariant.price_adjustment;
      onVariantChange(selectedVariant, finalPrice, selectedVariant.stock);
    } else if (!selectedVariant && onVariantChange) {
      onVariantChange(null, product.price || 0, product.stock || 0);
    }
  }, [selectedVariantId, variants, product.price, product.stock, product.colors, product.images, product.id, onVariantChange]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-16 h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Check if we have new variants or legacy color data
  if (variants.length === 0 && (!product.colors || product.colors.length === 0 || !product.images || product.images.length === 0)) {
    return null; // No variants available
  }

  // If no new variants but has legacy colors/images, create mock variants from legacy data
  const displayVariants = variants.length > 0 ? variants : (
    product.colors && product.images && product.colors.length > 0 && product.images.length > 0
      ? product.colors.map((color, index) => ({
          id: `legacy-${color}-${index}`,
          product_id: product.id,
          label: color,
          image_url: product.images![index] || product.images![0],
          hex_code: undefined,
          price_adjustment: 0,
          stock: product.stock || 0,
          is_default: index === 0,
          position: index,
        }))
      : []
  );

  const selectedVariant = displayVariants.find(v => v.id === selectedVariantId);
  const finalPrice = selectedVariant 
    ? (product.price || 0) + selectedVariant.price_adjustment 
    : (product.price || 0);

  return (
    <div className="space-y-4">
      {/* Color Swatches */}
      <div>
        <h3 className="text-sm font-medium mb-2">اللون</h3>
        <div className="flex flex-wrap gap-2">
          {displayVariants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariantId(variant.id)}
              className={`relative group ${
                selectedVariantId === variant.id
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'ring-1 ring-border hover:ring-2 hover:ring-primary/50'
              }`}
              disabled={variant.stock === 0}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img
                  src={variant.image_url}
                  alt={variant.label}
                  width={64}
                  height={64}
                  className={`w-full h-full object-cover ${
                    variant.stock === 0 ? 'grayscale opacity-50' : ''
                  }`}
                />
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                {variant.label}
              </div>
              {variant.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <span className="text-white text-xs font-bold">نفذ</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{selectedVariant.label}</p>
              <p className="text-lg font-bold text-primary">{finalPrice} جنيه</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedVariant.stock > 0 ? (
                <span className="text-green-600">متوفر ({selectedVariant.stock})</span>
              ) : (
                <span className="text-red-600">نفذ المخزون</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};