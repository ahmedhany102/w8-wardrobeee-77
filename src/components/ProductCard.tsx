import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/models/Product";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import CartDatabase from "@/models/CartDatabase";
import { useProductVariants } from "@/hooks/useProductVariants";
import ProductColorSwatch from "./ProductColorSwatch";
import ProductSizeButton from "./ProductSizeButton";

// Consistency for footer
interface ProductCardProps {
  product: Product;
  onAddToCart?: (
    product: Product,
    color: string,
    size: string,
    quantity?: number
  ) => void;
  className?: string;
}

const ProductCard = ({
  product,
  className = "",
  onAddToCart,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { variants } = useProductVariants(product.id);

  // Unique color options & mapping color to image
  const colorOptions = Array.from(new Set(variants.map((v) => v.color)));
  const colorImages = colorOptions.reduce<{ [color: string]: string }>(
    (acc, color) => {
      acc[color] =
        variants.find((v) => v.color === color)?.image_url ||
        product.main_image ||
        "/placeholder.svg";
      return acc;
    },
    {}
  );

  const [selectedColor, setSelectedColor] = useState(
    colorOptions[0] ?? ""
  );
  // Filter available sizes for selected color
  const sizeOptions = variants
    .filter((v) => v.color === selectedColor)
    .map((v) => ({ size: v.size, price: v.price, stock: v.stock }));

  // Set first available size on color change
  const [selectedSize, setSelectedSize] = useState(
    sizeOptions.length ? sizeOptions[0].size : ""
  );
  // Update sizeOptions/dependents when color changes
  React.useEffect(() => {
    const freshlyAvailable = variants
      .filter((v) => v.color === selectedColor && v.stock > 0)
      .map((v) => v.size);
    if (
      freshlyAvailable.length > 0 &&
      !freshlyAvailable.includes(selectedSize)
    ) {
      setSelectedSize(freshlyAvailable[0]);
    }
    if (freshlyAvailable.length === 0) setSelectedSize("");
    // eslint-disable-next-line
  }, [selectedColor]);

  // Get selected variant info
  const selectedVariant =
    variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    ) || variants.find((v) => v.color === selectedColor);

  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  // Color swatch select
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  // Size select
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  // Add to cart handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("المنتج غير متوفر حالياً");
      return;
    }

    try {
      const cartDb = CartDatabase.getInstance();
      await cartDb.addToCart(
        product,
        selectedSize,
        selectedColor,
        1
      );
      toast.success("تم إضافة المنتج إلى السلة");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("فشل في إضافة المنتج إلى السلة");
    }
  };

  // Clicking the card goes to details
  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-green-300 border-gray-200 relative ${className}`}
      onClick={handleProductClick}
    >
      <CardHeader className="p-0 pb-2 relative">
        <AspectRatio ratio={1} className="bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={
              selectedVariant?.image_url ||
              colorImages[selectedColor] ||
              product.main_image ||
              "/placeholder.svg"
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </AspectRatio>

        {/* Discount badge */}
        {product.hasDiscount && product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
            -{product.discount}%
          </div>
        )}
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
            <span className="text-white font-bold text-lg">غير متوفر</span>
          </div>
        )}

        {/* Color swatches, clickable */}
        {colorOptions.length > 1 && (
          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
            {colorOptions.map((color) => (
              <ProductColorSwatch
                key={color}
                color={color}
                selected={color === selectedColor}
                onSelect={() => handleColorSelect(color)}
              />
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-3 pb-2">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>

        {/* Price section */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-green-700">
            {selectedVariant
              ? selectedVariant.price.toFixed(0)
              : product.price}{" "}
            جنيه
          </span>
          {product.hasDiscount &&
            product.discount &&
            selectedVariant &&
            (selectedVariant.price * (100 / (100 - product.discount)) > selectedVariant.price) && (
              <span className="text-sm text-gray-500 line-through">
                {(selectedVariant.price * (100 / (100 - product.discount))).toFixed(0)} جنيه
              </span>
            )}
        </div>

        {/* Sizes for selected color */}
        {sizeOptions.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-600">المقاسات:</span>
            <div className="flex gap-1 flex-wrap">
              {sizeOptions.slice(0, 4).map(({ size, stock }) => (
                <ProductSizeButton
                  key={size}
                  size={size}
                  selected={size === selectedSize}
                  disabled={stock <= 0}
                  onSelect={() => handleSizeSelect(size)}
                />
              ))}
              {sizeOptions.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{sizeOptions.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Place Add to Cart button always at the bottom */}
      <CardFooter className="p-3 pt-0 flex flex-col justify-end">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full text-sm flex justify-center items-center ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? "غير متوفر" : "أضف للسلة"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
