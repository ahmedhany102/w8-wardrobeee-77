
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { Product, default as ProductDatabase } from '@/models/Product';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const Offers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDiscountedProducts();
  }, []);

  const fetchDiscountedProducts = async () => {
    setIsLoading(true);
    try {
      const productDb = ProductDatabase.getInstance();
      const allProducts = await productDb.getAllProducts();
      
      // Filter for products with a discount (in a real app, you'd have a discount field)
      // For demo purposes, we'll consider every third product as "on sale"
      const discountedProducts = allProducts.filter((_, index) => index % 3 === 0);
      setProducts(discountedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    // This would reuse the same addToCart logic
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="mb-8 relative overflow-hidden rounded-lg">
          <AspectRatio ratio={16/6} className="bg-gradient-to-r from-red-600 to-orange-600">
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4">
              <h1 className="text-3xl font-bold mb-2">Hot Deals & Offers!</h1>
              <p className="text-lg text-center max-w-md">Limited time discounts on our best products</p>
            </div>
          </AspectRatio>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No offers available at the moment</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="flex items-center mb-4">
                <Badge className="bg-red-500 text-white mr-2">HOT</Badge>
                <h2 className="text-xl font-bold">Limited Time Offers</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      ...product,
                      price: Math.floor(product.price * 0.8) // Simulate 20% off
                    }} 
                    onAddToCart={handleAddToCart} 
                  />
                ))}
              </div>
            </div>
            
            {products.length > 4 && (
              <div>
                <div className="flex items-center mb-4">
                  <Badge className="bg-amber-500 text-white mr-2">CLEARANCE</Badge>
                  <h2 className="text-xl font-bold">Clearance Sale</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.slice(4).map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={{
                        ...product,
                        price: Math.floor(product.price * 0.7) // Simulate 30% off
                      }} 
                      onAddToCart={handleAddToCart} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Offers;
