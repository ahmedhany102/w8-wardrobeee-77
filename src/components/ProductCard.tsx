
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from '@/models/Product';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  className?: string;
}

const ProductCard = ({ product, onAddToCart, className = '' }: ProductCardProps) => {
  return (
    <Card className={`hover:shadow-lg transition-all overflow-hidden animate-fade-in ${className}`}>
      <CardHeader className="p-0">
        <div className="relative">
          <AspectRatio ratio={4/3} className="bg-gray-100">
            <img 
              src={product.image || '/placeholder.svg'} 
              alt={product.name}
              className="object-cover w-full h-full"
              loading="lazy"
              onError={(e) => {
                // If the image fails to load, set a placeholder
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </AspectRatio>
          
          {product.offerPrice && (
            <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-medium text-sm">
              Sale
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm truncate">{product.category}</p>
        
        <div className="mt-2">
          {product.offerPrice ? (
            <div className="flex items-center">
              <span className="text-lg font-bold text-orange-600">{product.offerPrice} EGP</span>
              <span className="ml-2 text-sm text-gray-400 line-through">{product.price} EGP</span>
            </div>
          ) : (
            <span className="text-lg font-bold">{product.price} EGP</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onAddToCart(product)}
          className="w-full bg-orange-600 hover:bg-orange-700 transition-colors"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
