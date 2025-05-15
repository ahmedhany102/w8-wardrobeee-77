
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductCategory, default as ProductDatabase } from '@/models/Product';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    // Load cart from localStorage on component mount
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage', error);
      }
    }
    
    // Add event listener for cart updates
    const handleCartUpdate = () => {
      const updatedCartJSON = localStorage.getItem('cart');
      if (updatedCartJSON) {
        try {
          const updatedCart = JSON.parse(updatedCartJSON);
          setCart(updatedCart);
        } catch (error) {
          console.error("Error parsing updated cart data:", error);
        }
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const productDb = ProductDatabase.getInstance();
      const allProducts = await productDb.getAllProducts();
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      // If search is empty, reset to all products in current category
      setFilteredProducts(
        activeTab === 'ALL' 
          ? products 
          : products.filter(product => product.category === activeTab)
      );
    } else {
      // Filter products based on search query and current category
      const lowercaseQuery = query.toLowerCase();
      
      const searchResults = products.filter(product => {
        const matchesSearch = 
          product.name.toLowerCase().includes(lowercaseQuery) || 
          product.description.toLowerCase().includes(lowercaseQuery);
        
        const matchesCategory = activeTab === 'ALL' || product.category === activeTab;
        
        return matchesSearch && matchesCategory;
      });
      
      setFilteredProducts(searchResults);
    }
  };

  // Reset filtered products when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Reset search when changing tabs
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      setFilteredProducts(
        value === 'ALL' 
          ? products 
          : products.filter(product => product.category === value)
      );
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      // Save selected product in localStorage and redirect to login
      localStorage.setItem('pendingProduct', JSON.stringify(product));
      toast.info('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    // Don't allow admins to shop
    if (isAdmin) {
      toast.error("Admin accounts cannot make purchases");
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      const updatedCart = cart.map(item => 
        item.product.id === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + 1,
            } 
          : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      const newCart = [
        ...cart, 
        {
          product: product,
          quantity: 1,
        }
      ];
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
    
    toast.success(`${product.name} added to cart`);
  };

  const handleUpdateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      const updatedCart = cart.filter(item => item.product.id !== productId);
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = cart.map(item => 
        item.product.id === productId 
          ? { 
              ...item, 
              quantity,
            } 
          : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
    
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    setShowCartDialog(false);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('Please log in to checkout');
      navigate('/login');
      return;
    }
    
    // Don't allow admins to checkout
    if (isAdmin) {
      toast.error("Admin accounts cannot make purchases");
      return;
    }
    
    navigate('/cart');
    setShowCartDialog(false);
  };

  // Don't show cart button for admin users
  const showCartButton = user && !isAdmin;

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-green-500">Our Products</h2>
        {showCartButton && (
          <div className="relative">
            <Button
              onClick={() => setShowCartDialog(true)}
              className="bg-green-800 hover:bg-green-900 interactive-button"
            >
              Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
            </Button>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />
      
      <Tabs defaultValue="ALL" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-center overflow-x-auto pb-4">
          <TabsList className="mb-8 bg-gradient-to-r from-green-900 to-black flex justify-between space-x-8 px-8 w-auto">
            <TabsTrigger 
              value="ALL" 
              className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800 px-5"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value={ProductCategory.FOOD} 
              className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800 px-5"
            >
              Food
            </TabsTrigger>
            <TabsTrigger 
              value={ProductCategory.TECHNOLOGY} 
              className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800 px-5"
            >
              Technology
            </TabsTrigger>
            <TabsTrigger 
              value={ProductCategory.CLOTHING} 
              className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800 px-5"
            >
              Clothing
            </TabsTrigger>
            <TabsTrigger 
              value={ProductCategory.SHOES} 
              className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800 px-5"
            >
              Shoes
            </TabsTrigger>
          </TabsList>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl text-gray-500 mb-4">No products found</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                handleSearch('');
              }}
              className="bg-green-800 hover:bg-green-900 interactive-button"
            >
              Clear Search
            </Button>
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
      </Tabs>

      {/* Shopping Cart Dialog */}
      <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-green-900 to-black text-white">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-green-800 pb-2">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center p-2 border-b border-green-800">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-300">{item.product.price.toFixed(2)} EGP × {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateCartItem(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-green-800 hover:bg-green-700 interactive-button"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateCartItem(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-green-800 hover:bg-green-700 interactive-button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-green-800 pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{calculateTotal().toFixed(2)} EGP</span>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleClearCart}
                    className="border-red-700 text-red-400 hover:bg-red-900/30"
                  >
                    Clear Cart
                  </Button>
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="bg-green-800 hover:bg-green-700 interactive-button"
                    disabled={cart.length === 0}
                  >
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalog;
