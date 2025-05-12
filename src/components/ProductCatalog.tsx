
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductCategory, default as ProductDatabase } from '@/models/Product';
import { toast } from 'sonner';
import { OrderItem } from '@/models/Order';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import OrderForm from './OrderForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    // Load cart from localStorage on component mount
    const savedCart = localStorage.getItem('userCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('userCart', JSON.stringify(cart));
      // Dispatch custom event for other components to update
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cart]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const productDb = ProductDatabase.getInstance();
      const allProducts = await productDb.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
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

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              totalPrice: (item.quantity + 1) * item.unitPrice 
            } 
          : item
      ));
    } else {
      setCart([
        ...cart, 
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price
        }
      ]);
    }
    
    toast.success(`${product.name} added to cart`);
  };

  const handleUpdateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { 
              ...item, 
              quantity,
              totalPrice: quantity * item.unitPrice 
            } 
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('userCart');
    setShowCartDialog(false);
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
    
    setShowCartDialog(false);
    setShowOrderForm(true);
  };

  const handleOrderComplete = () => {
    setShowOrderForm(false);
    setCart([]);
    localStorage.removeItem('userCart');
    toast.success('Thank you for your order!');
  };

  const getFilteredProducts = () => {
    if (activeTab === 'ALL') {
      return products;
    }
    return products.filter(product => product.category === activeTab);
  };

  // Don't show cart button for admin users
  const showCartButton = user && !isAdmin;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-green-500">Our Products</h2>
        {showCartButton && (
          <div className="relative">
            <Button
              onClick={() => setShowCartDialog(true)}
              className="bg-green-800 hover:bg-green-900"
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
      
      <Tabs defaultValue="ALL" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-4">
          <TabsList className="mb-8 w-full bg-gradient-to-r from-green-900 to-black flex justify-center space-x-12 px-4">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {getFilteredProducts().map((product) => (
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
                    <div key={item.productId} className="flex justify-between items-center p-2 border-b border-green-800">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-300">{item.unitPrice.toFixed(2)} EGP × {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateCartItem(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-green-800 hover:bg-green-700"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateCartItem(item.productId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-green-800 hover:bg-green-700"
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
                    className="bg-green-800 hover:bg-green-700"
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

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-b from-green-900 to-black text-white overflow-y-auto max-h-[90vh]">
          <OrderForm 
            items={cart} 
            totalAmount={calculateTotal()} 
            onOrderComplete={handleOrderComplete} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalog;
