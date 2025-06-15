
import React from 'react';
import ProductCard from './ProductCard';
import { Button } from './ui/button';

interface ProductGridProps {
  products: any[];
  loading: boolean;
  searchQuery: string;
  onAddToCart: (product: any, size: string, quantity?: number) => Promise<void>;
  onClearSearch: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  loading, 
  searchQuery, 
  onAddToCart, 
  onClearSearch 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-xl text-gray-500 mb-4">No products found</p>
        <Button 
          onClick={onClearSearch}
          className="bg-green-800 hover:bg-green-900 interactive-button"
        >
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {products.filter(product => product).map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart} 
        />
      ))}
    </div>
  );
};

export default ProductGrid;
