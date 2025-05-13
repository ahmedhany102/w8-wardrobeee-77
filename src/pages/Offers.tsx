
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { Product, default as ProductDatabase } from '@/models/Product';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';

const Offers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchDiscountedProducts();
    
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    // Auto-sliding functionality
    if (products.length > 0) {
      startAutoSlide();
    }
    
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [products]);

  const startAutoSlide = () => {
    // Clear any existing interval
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }
    
    // Set up an interval to scroll the carousel
    carouselIntervalRef.current = setInterval(() => {
      if (carouselRef.current) {
        const scrollAmount = carouselRef.current.scrollWidth / products.length;
        carouselRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
        
        // Reset to beginning if reached the end
        if (carouselRef.current.scrollLeft + carouselRef.current.clientWidth >= carouselRef.current.scrollWidth - 10) {
          carouselRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        }
      }
    }, 3000); // Scroll every 3 seconds
  };

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
    // Add to cart functionality
    const userCart = localStorage.getItem('userCart') || '[]';
    let cart = JSON.parse(userCart);
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex((item: any) => item.id === product.id);
    
    if (existingProductIndex >= 0) {
      // Increase quantity if product already in cart
      cart[existingProductIndex].quantity += 1;
    } else {
      // Add new product with quantity 1
      cart.push({
        ...product,
        quantity: 1
      });
    }
    
    // Save cart back to localStorage
    localStorage.setItem('userCart', JSON.stringify(cart));
    
    // Dispatch event to update cart count
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 mb-20">
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
            {/* Auto-sliding offers section */}
            <div>
              <div className="flex items-center mb-4">
                <Badge className="bg-red-500 text-white mr-2">HOT</Badge>
                <h2 className="text-xl font-bold">Limited Time Offers</h2>
              </div>
              
              <div className="relative">
                <div className="overflow-x-auto hide-scrollbar pb-6" ref={carouselRef}>
                  <div className="flex gap-4 w-max">
                    {products.map((product) => (
                      <div key={product.id} className="min-w-[280px]">
                        <ProductCard 
                          product={{
                            ...product,
                            price: Math.floor(product.price * 0.8) // Simulate 20% off
                          }} 
                          onAddToCart={handleAddToCart} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Second offers section - also auto-sliding */}
            {products.length > 4 && (
              <div>
                <div className="flex items-center mb-4">
                  <Badge className="bg-amber-500 text-white mr-2">CLEARANCE</Badge>
                  <h2 className="text-xl font-bold">Clearance Sale</h2>
                </div>
                
                <Carousel className="w-full">
                  <CarouselContent className="auto-scroll">
                    {products.map((product) => (
                      <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <ProductCard 
                            product={{
                              ...product,
                              price: Math.floor(product.price * 0.7) // Simulate 30% off
                            }} 
                            onAddToCart={handleAddToCart} 
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            )}
          </div>
        )}
        
        {/* Add a section that shows all offers */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h2 className="text-2xl font-bold mb-6">All Current Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  price: Math.floor(product.price * 0.75) // Simulate 25% off
                }} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Offers;
