
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductDatabase } from '@/models/Product';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

// Define subcategories
const MEN_SUBCATEGORIES = ['All', 'T-shirts', 'Pants', 'Shoes', 'Jackets'];

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
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
      // Filter for men's products only (no Kids, no Women's)
      const menOnly = allProducts.filter(
        product => product && 
          product.category === 'رجالي' || 
          product.category === 'Men' || 
          product.category === "Men's"
      );
      setProducts(menOnly);
      setFilteredProducts(menOnly);
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
    filterProducts(activeSubcategory, query);
  };

  // Main filter function that combines category, subcategory, and search filtering
  const filterProducts = (subcategory: string, query: string = searchQuery) => {
    const lowercaseQuery = query.toLowerCase();
    
    let filtered = products;
    
    // Filter by subcategory if not "All"
    if (subcategory !== 'All') {
      filtered = filtered.filter(product => 
        product && product.type && product.type.toLowerCase() === subcategory.toLowerCase()
      );
    }
    
    // Apply search filter if there's a query
    if (lowercaseQuery) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        return (
          (product.name?.toLowerCase().includes(lowercaseQuery) || false) || 
          (product.description?.toLowerCase().includes(lowercaseQuery) || false) ||
          (product.type?.toLowerCase().includes(lowercaseQuery) || false)
        );
      });
    }
    
    setFilteredProducts(filtered);
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategory: string) => {
    setActiveSubcategory(subcategory);
    filterProducts(subcategory);
  };

  const handleAddToCart = async (product: Product, size: string, quantity: number = 1) => {
    if (!user) {
      localStorage.setItem('pendingProduct', JSON.stringify(product));
      toast.info('Please login to add items to your cart');
      navigate('/login');
      return;
    }
    if (isAdmin) {
      toast.error("Admin accounts cannot make purchases");
      return;
    }
    
    // Check stock before adding to cart
    if (product.sizes) {
      const sizeObj = product.sizes.find(s => s && s.size === size);
      if (sizeObj && sizeObj.stock <= 0) {
        toast.error('This product is out of stock');
        return;
      }
    }
    
    const cartDb = (await import('@/models/CartDatabase')).default.getInstance();
    const success = await cartDb.addToCart(product, size.toString(), product.colors?.[0] || "", quantity);
    if (success) {
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error('Failed to add product to cart');
    }
  };

  const handleUpdateCartItem = (productId: string, quantity: number) => {
    if (!productId) {
      console.error("Invalid productId provided to handleUpdateCartItem");
      return;
    }
    
    if (quantity <= 0) {
      const updatedCart = cart.filter(item => item && item.product && item.product.id !== productId);
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = cart.map(item => 
        item.product && item.product.id === productId 
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
    return cart.reduce((sum, item) => {
      // Check if item.product exists and has a price before calculating
      if (item.product && typeof item.product.price === 'number') {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);
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
        <h2 className="text-3xl font-bold text-green-500">Men's Products</h2>
        {showCartButton && (
          <div className="relative">
            <Button
              onClick={() => setShowCartDialog(true)}
              className="bg-green-800 hover:bg-green-900 interactive-button"
            >
              Cart ({cart.reduce((total, item) => total + (item.quantity || 0), 0)})
            </Button>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />
      
      {/* Subcategories */}
      <div className="mb-8">
        <div className="flex justify-center overflow-x-auto pb-4">
          <div className="bg-gradient-to-r from-green-900 to-black inline-flex rounded-md p-1">
            {MEN_SUBCATEGORIES.map(subcategory => (
              <button
                key={subcategory}
                onClick={() => handleSubcategoryChange(subcategory)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  activeSubcategory === subcategory 
                    ? 'bg-green-200 text-green-800' 
                    : 'text-white hover:text-green-200'
                }`}
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
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
              setActiveSubcategory('All');
              filterProducts('All', '');
            }}
            className="bg-green-800 hover:bg-green-900 interactive-button"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {filteredProducts.filter(product => product).map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart} 
            />
          ))}
        </div>
      )}

      {/* Shopping Cart Dialog - Only Cash on Delivery */}
      <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-green-900 to-black text-white" aria-describedby="cart-contents">
          <div className="space-y-4" id="cart-contents">
            <h2 className="text-xl font-bold text-white border-b border-green-800 pb-2">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {cart.filter(item => item && item.product && item.product.id).map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center p-2 border-b border-green-800">
                      <div>
                        <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-300">{item.product?.price?.toFixed(2) || '0.00'} EGP × {item.quantity}</p>
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
                  <p className="text-sm text-green-300 mt-2">Payment Method: Cash on Delivery</p>
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
