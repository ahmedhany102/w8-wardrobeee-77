import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Product, default as ProductDatabase } from '@/models/Product';
import SearchBar from '@/components/SearchBar';
import CartDatabase from '@/models/CartDatabase';

const CategoryButton = ({ category, active, onClick }: { category: string, active: boolean, onClick: () => void }) => (
  <Button 
    className={`rounded-full px-4 ${active ? 'bg-green-700' : 'border-green-700 text-green-500'}`}
    onClick={onClick}
  >
    {category}
  </Button>
);

const Index = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
    const handleProductsUpdated = () => {
      fetchProducts();
    };
    window.addEventListener('productsUpdated', handleProductsUpdated);
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const productDb = ProductDatabase.getInstance();
      const allProducts = await productDb.getAllProducts();
      setProducts(allProducts);
      const uniqueCategories = ['All', ...new Set(allProducts.map(p => p.category))];
      setCategories(uniqueCategories);
      filterProducts(allProducts, selectedCategory, searchQuery);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = (
    productList = products, 
    category = selectedCategory, 
    query = searchQuery
  ) => {
    let filtered = productList;
    if (category !== 'All') {
      filtered = filtered.filter(product => product.category === category);
    }
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery)
      );
    }
    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product: Product) => {
    const cartDb = CartDatabase.getInstance();
    const success = await cartDb.addToCart(product, 1);
    if (success) {
      window.dispatchEvent(new Event('cartUpdated'));
      // يمكنك إضافة toast هنا إذا أردت
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
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
              Discover the best products in Egypt with our premium selection of clothing and shoes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in animation-delay-150">
              {!user ? (
                <>
                  <Button asChild className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-transparent border-2 border-green-400 text-white hover:bg-green-800 px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                  <Button asChild className="bg-transparent border-2 border-green-400 text-white hover:bg-green-800 px-8 py-3 rounded-md text-lg transition-transform hover:scale-105 active:scale-95">
                    <Link to="/admin-login">Admin Login</Link>
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

        {/* Search Bar */}
        <section className="mb-8">
          <SearchBar onSearch={handleSearch} className="max-w-md mx-auto" />
        </section>

        {/* Categories Carousel */}
        <section className="mb-8 overflow-hidden">
          <h2 className="text-2xl font-bold text-green-500 mb-4">Categories</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
            {categories.map(category => (
              <CategoryButton 
                key={category} 
                category={category}
                active={selectedCategory === category}
                onClick={() => handleCategoryChange(category)}
              />
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section id="products" className="py-8">
          <h2 className="text-2xl font-bold text-green-500 mb-6">
            {searchQuery ? `Search Results for "${searchQuery}"` : 
             selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800"></div>
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.filter(
                (product) => product && typeof product === "object" && product.name
              ).map((product) =>
                product ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ) : null
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xl text-gray-500 mb-4">No products found</p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery('')} className="border-green-500 text-green-700">
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Index;
