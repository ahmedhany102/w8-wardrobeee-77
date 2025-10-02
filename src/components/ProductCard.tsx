
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from '@/models/Product';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import CartDatabase from "@/models/CartDatabase";
import { useProductVariants } from '@/hooks/useProductVariants';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, size: string, quantity?: number) => void;
  className?: string;
}

const ProductCard = ({ product, className = '' }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const { variants, fetchVariants } = useProductVariants(product.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (product.id) {
      fetchVariants();
    }
  }, [product.id]);

  useEffect(() => {
    if (variants.length > 0) {
      const defaultVariant = variants.find(v => v.is_default) || variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [variants]);

  if (!product || typeof product !== "object") {
    console.warn('⚠️ Invalid product passed to ProductCard:', product);
    return null;
  }

  // Use variant image if available, otherwise fallback to product main image
  const mainImage = selectedVariant?.image_url || 
    (product.mainImage && product.mainImage !== "" ? product.mainImage : null) ||
    (product.main_image && product.main_image !== "" ? product.main_image : null) ||
    (product.image_url && product.image_url !== "" ? product.image_url : null) ||
    (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ||
    "/placeholder.svg";
  
  // Check if product is out of stock - Fix availability logic
  const isOutOfStock = variants.length > 0 
    ? variants.every(v => v.stock <= 0)
    : (Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes.every(s => !s || s.stock <= 0) 
        : ((product.inventory || 0) === 0 && (product.stock || 0) === 0));
  
  // Calculate price (base price + variant adjustment)
  const basePrice = product.price || 0;
  const finalPrice = selectedVariant 
    ? basePrice + (selectedVariant.price_adjustment || 0)
    : (Array.isArray(product.sizes) && product.sizes.length > 0 
        ? Math.min(...product.sizes.filter(s => s && s.stock > 0).map(s => s.price || basePrice)) 
        : basePrice);

  // Calculate original price if there is a discount
  const originalPrice = product.hasDiscount && product.discount 
    ? finalPrice * (100 / (100 - product.discount)) 
    : finalPrice;

  // Quick add to cart handler with enhanced error handling
  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isOutOfStock) {
      toast.error("المنتج غير متوفر حالياً");
      return;
    }

    try {
      // For products with variants
      if (selectedVariant) {
        const productForCart = {
          ...product,
          price: finalPrice,
          mainImage: selectedVariant.image_url,
          inventory: selectedVariant.stock
        };
        
        const cartDb = CartDatabase.getInstance();
        await cartDb.addToCart(productForCart, 'متاح', selectedVariant.label, 1);
      } else {
        // Legacy system for products without variants
        let size = "";
        let color = "";
        
        const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
        if (productSizes.length > 0) {
          const availableSize = productSizes.find(s => s && s.stock > 0);
          if (availableSize) {
            size = availableSize.size;
          }
        }

        if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
          color = product.colors[0];
        }

        const cartDb = CartDatabase.getInstance();
        await cartDb.addToCart(product, size, color, 1);
      }

      toast.success("تم إضافة المنتج إلى السلة");
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("فشل في إضافة المنتج إلى السلة");
    }
  };

  // Handle product click to view details
  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-green-300 border-gray-200 ${className}`}
      onClick={handleProductClick}
      style={{ minHeight: '380px' }}
    >
      <CardHeader className="p-0 pb-2">
        <AspectRatio ratio={1} className="bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            width="300"
            height="300"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </AspectRatio>
        
        {/* Discount badge */}
        {product.hasDiscount && product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discount}%
          </div>
        )}
        
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
            <span className="text-white font-bold text-lg">غير متوفر</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 pb-2">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>
        
        {/* Price section */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-primary">
            {finalPrice.toFixed(0)} جنيه
          </span>
          {product.hasDiscount && product.discount && originalPrice > finalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toFixed(0)} جنيه
            </span>
          )}
        </div>

        {/* Color Variants */}
        {variants.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-muted-foreground">الألوان:</span>
            <div className="flex gap-1">
              {variants.slice(0, 4).map((variant) => (
                <button
                  key={variant.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(variant);
                  }}
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedVariant?.id === variant.id 
                      ? 'border-primary shadow-md' 
                      : 'border-gray-300'
                  }`}
                  style={{
                    backgroundImage: `url(${variant.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  title={variant.label}
                />
              ))}
              {variants.length > 4 && (
                <span className="text-xs text-muted-foreground">+{variants.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Legacy Available colors (for backward compatibility) */}
        {variants.length === 0 && product.colors && Array.isArray(product.colors) && product.colors.length > 1 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-muted-foreground">الألوان:</span>
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-muted-foreground">+{product.colors.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Available sizes (only show for legacy products without variants) */}
        {variants.length === 0 && Array.isArray(product.sizes) && product.sizes.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-muted-foreground">المقاسات:</span>
            <div className="flex gap-1 flex-wrap">
              {product.sizes.slice(0, 4).map((sizeInfo, index) => (
                <span
                  key={index}
                  className={`text-xs px-1 py-0.5 rounded border ${
                    sizeInfo.stock > 0 
                      ? 'bg-primary/10 border-primary/20 text-primary' 
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  {sizeInfo.size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-xs text-muted-foreground">+{product.sizes.length - 4}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <Button
          onClick={handleQuickAddToCart}
          disabled={isOutOfStock}
          className={`w-full text-sm ${
            isOutOfStock 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? 'غير متوفر' : 'أضف للسلة'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
