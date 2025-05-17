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
              src={product.imageUrl || '/placeholder.svg'} 
              alt={product.name}
              className="object-cover w-full h-full"
              loading="lazy"
              onError={(e) => {
                // If the image fails to load, set a placeholder
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </AspectRatio>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm truncate">{product.category}</p>
        
        <div className="mt-2">
          <span className="text-lg font-bold">{product.price} EGP</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onAddToCart(product)}
          className="w-full bg-green-600 hover:bg-green-700 transition-colors"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
