
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, ProductCategory } from '@/models/Product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const getCategoryLabel = (category: ProductCategory) => {
  switch (category) {
    case ProductCategory.FOOD:
      return 'Food';
    case ProductCategory.TECHNOLOGY:
      return 'Technology';
    case ProductCategory.CLOTHING:
      return 'Clothing';
    case ProductCategory.SHOES:
      return 'Shoes';
    default:
      return 'Other';
  }
};

const getCategoryColor = (category: ProductCategory) => {
  switch (category) {
    case ProductCategory.FOOD:
      return 'bg-amber-500';
    case ProductCategory.TECHNOLOGY:
      return 'bg-blue-500';
    case ProductCategory.CLOTHING:
      return 'bg-purple-500';
    case ProductCategory.SHOES:
      return 'bg-pink-500';
    default:
      return 'bg-gray-500';
  }
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative overflow-hidden h-48">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <span className={`absolute top-2 right-2 ${getCategoryColor(product.category)} text-white text-xs px-2 py-1 rounded-full`}>
          {getCategoryLabel(product.category)}
        </span>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg truncate">{product.name}</h3>
          <Badge variant="success" className="ml-2 whitespace-nowrap">
            {product.price.toFixed(2)} EGP
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm text-gray-600 flex-grow">
        <p className="line-clamp-2">{product.description}</p>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => onAddToCart(product)} 
          className="w-full bg-green-800 hover:bg-green-900 transition-transform active:scale-95"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
