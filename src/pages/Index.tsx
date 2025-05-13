
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Product, ProductCategory, default as ProductDatabase } from '@/models/Product';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { toast } from 'sonner';

const CategoryButton = ({ category, active, onClick }: { category: string, active: boolean, onClick: () => void }) => (
  <Button 
    variant={active ? "default" : "outline"}
    className={`rounded-full px-4 ${active ? 'bg-green-700' : 'border-green-700 text-green-500'}`}
    onClick={onClick}
  >
    {category}
  </Button>
);

const categoryIcons: Record<string, string> = {
  [ProductCategory.FOOD]: '🍔',
  [ProductCategory.TECHNOLOGY]: '📱',
  [ProductCategory.CLOTHING]: '👕',
  [ProductCategory.SHOES]: '👟',
  'All': '🛍️',
};

const Index = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const productDb = ProductDatabase.getInstance();
      const allProducts = await productDb.getAllProducts();
      setProducts(allProducts);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(allProducts.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    toast.success(`${product.name} added to cart`);
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Get featured products (first 3 products for each category)
  const getFeaturedProducts = (category: string) => {
    if (category === 'All') {
      return products.slice(0, 6);
    }
    return products
      .filter(product => product.category === category)
      .slice(0, 6);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-12 md:py-16 rounded-lg overflow-hidden relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-black opacity-90"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-fade-in">
              Welcome to W8
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-100">
              Discover the best products in Egypt with our premium selection of food, technology, clothing, and shoes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in animation-delay-150">
              {!user ? (
                <>
                  <Button asChild className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-transparent border-2 border-green-400 text-white hover:bg-green-800 px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                  <Button asChild variant="outline" className="bg-transparent border-2 border-green-400 text-white hover:bg-green-800 px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                    <Link to="/admin-login">
                      <Shield className="h-5 w-5 mr-2" />
                      <span>Admin Login</span>
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                  <a href="#products">Browse Products</a>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Categories Carousel */}
        <section className="mb-8 overflow-hidden">
          <h2 className="text-2xl font-bold text-green-500 mb-4">Categories</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
            {categories.map(category => (
              <CategoryButton 
                key={category} 
                category={`${categoryIcons[category] || '🔍'} ${category}`}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>
        </section>

        {/* Featured Products Carousel */}
        <section id="featured" className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-500">Featured Products</h2>
            <Link to="/offers" className="text-sm font-medium text-green-400">
              See All Offers →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {getFeaturedProducts(selectedCategory).map((product) => (
                  <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <ProductCard product={product} onAddToCart={handleAddToCart} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-end gap-2 mt-4">
                <CarouselPrevious className="static translate-y-0 mr-2" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          )}
        </section>

        {/* Products Grid */}
        <section id="products" className="py-8">
          <h2 className="text-2xl font-bold text-green-500 mb-6">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xl text-gray-500 mb-4">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Index;
