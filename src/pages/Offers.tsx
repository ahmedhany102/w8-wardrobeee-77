
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/models/Product';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  applicableProducts: string[];
  active: boolean;
  category?: string;
}

const Offers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { user } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchOffersAndProducts();
  }, []);
  
  const fetchOffersAndProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch offers
      const storedOffers = localStorage.getItem('offers');
      let activeOffers: Offer[] = [];
      
      if (storedOffers) {
        const parsedOffers = JSON.parse(storedOffers);
        // Filter only active offers
        activeOffers = parsedOffers.filter((offer: Offer) => 
          offer.active && new Date(offer.endDate) >= new Date()
        );
        setOffers(activeOffers);
        
        // Get unique categories
        const uniqueCategories = Array.from(
          new Set(activeOffers.map((offer: Offer) => offer.category || 'Other'))
        );
        setCategories(uniqueCategories);
      }
      
      // Fetch products
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        const allProducts = JSON.parse(storedProducts);
        
        // Get products that have active offers
        const productsWithOffers = allProducts.filter((product: Product) => 
          product.offerPrice !== undefined
        );
        
        setProducts(productsWithOffers);
      }
    } catch (error) {
      console.error('Error fetching offers and products:', error);
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
  
  const getProductsForCategory = (category: string) => {
    if (category === "all") {
      return products;
    }
    
    // Find offers for this category
    const categoryOffers = offers.filter(offer => 
      offer.category === category
    );
    
    // Get product IDs from these offers
    const productIds = categoryOffers.flatMap(offer => offer.applicableProducts);
    
    // Return matching products
    return products.filter(product => productIds.includes(product.id));
  };
  
  const displayedProducts = getProductsForCategory(selectedCategory);
  
  const formatDiscountPercentage = (originalPrice: number, offerPrice?: number) => {
    if (!offerPrice) return 0;
    return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 mb-20">
        <div className="mb-8 relative overflow-hidden rounded-lg">
          <AspectRatio ratio={16/6} className="bg-gradient-to-r from-orange-600 to-amber-500">
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4">
              <h1 className="text-3xl font-bold mb-2">Hot Deals & Offers!</h1>
              <p className="text-lg text-center max-w-md">Limited time discounts on our best products</p>
            </div>
          </AspectRatio>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No offers available at the moment</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured offers carousel */}
            <div>
              <div className="flex items-center mb-4">
                <Badge className="bg-orange-500 text-white mr-2">HOT</Badge>
                <h2 className="text-xl font-bold">Limited Time Offers</h2>
              </div>
              
              <div className="relative">
                <div className="overflow-x-auto hide-scrollbar pb-6" ref={carouselRef}>
                  <div className="flex gap-4 w-max animate-slide">
                    {products.slice(0, 8).map((product) => (
                      <div key={product.id} className="min-w-[280px]">
                        <ProductCard 
                          product={product}
                          onAddToCart={handleAddToCart} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories tabs */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-6">Browse Offers by Category</h2>
              
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="mb-6 overflow-x-auto flex w-full justify-start pb-2 px-1">
                  <TabsTrigger value="all" className="flex-none">
                    All Offers
                  </TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="flex-none">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value={selectedCategory} className="pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {displayedProducts.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
        
        {/* All offers section */}
        {products.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6">All Current Offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group relative">
                  <ProductCard 
                    product={product} 
                    onAddToCart={handleAddToCart} 
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {formatDiscountPercentage(product.price, product.offerPrice)}% OFF
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Offers;
