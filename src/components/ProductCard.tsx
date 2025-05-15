
import React from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Product } from '@/models/Product';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import CartDatabase from '@/models/CartDatabase';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    try {
      const cartDb = CartDatabase.getInstance();
      const success = await cartDb.addToCart(product, 1);
      
      if (success) {
        toast.success(`${product.name} added to cart!`);
        if (onAddToCart) onAddToCart(product);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };
  
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };
  
  // Calculate discount percentage if the product has an offerPrice
  const hasDiscount = product.offerPrice !== undefined && product.offerPrice < product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - (product.offerPrice || 0)) / product.price) * 100) 
    : 0;

  return (
    <Card 
      className="product-card h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg border-green-100 hover:border-green-300 max-w-xs mx-auto"
      onClick={handleClick}
    >
      <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-50">
        {hasDiscount && (
          <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 z-10">
            {discountPercentage}% OFF
          </div>
        )}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image w-full h-full object-contain p-2"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/200?text=Product Image';
          }}
        />
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-base line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-xs line-clamp-2 h-8 mt-1">{product.description}</p>
        
        <div className="mt-2 flex items-center">
          {hasDiscount ? (
            <>
              <span className="font-semibold text-red-600">{product.offerPrice} EGP</span>
              <span className="text-gray-400 text-xs line-through ml-2">{product.price} EGP</span>
            </>
          ) : (
            <span className="font-semibold">{product.price} EGP</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0">
        <Button 
          variant="default" 
          className="w-full bg-green-800 hover:bg-green-900 text-xs h-8"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
