
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

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

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
    setShowCartDialog(false);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('Please log in to checkout');
      return;
    }
    
    setShowCartDialog(false);
    setShowOrderForm(true);
  };

  const handleOrderComplete = () => {
    setShowOrderForm(false);
    setCart([]);
    toast.success('Thank you for your order!');
  };

  const getFilteredProducts = () => {
    if (activeTab === 'ALL') {
      return products;
    }
    return products.filter(product => product.category === activeTab);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-green-900">Our Products</h2>
        <div className="relative">
          <Button
            onClick={() => setShowCartDialog(true)}
            className="bg-green-800 hover:bg-green-900"
          >
            Cart ({cart.length})
          </Button>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="ALL" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-4">
          <TabsList className="grid grid-cols-5 w-full mb-8">
            <TabsTrigger 
              value="ALL" 
              className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value={ProductCategory.FOOD} 
              className="data-[state=active]:bg-amber-200 data-[state=active]:text-amber-800"
            >
              Food
            </TabsTrigger>
            <TabsTrigger 
              value={ProductCategory.TECHNOLOGY} 
              className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800"
            >
              Technology
            </TabsTrigger>
            <TabsTrigger 
              value={ProductCategory.CLOTHING} 
              className="data-[state=active]:bg-purple-200 data-[state=active]:text-purple-800"
            >
              Clothing
            </TabsTrigger>
            <TabsTrigger 
              value={ProductCategory.SHOES} 
              className="data-[state=active]:bg-pink-200 data-[state=active]:text-pink-800"
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
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-green-800 border-b pb-2">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">{item.unitPrice.toFixed(2)} EGP × {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateCartItem(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateCartItem(item.productId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{calculateTotal().toFixed(2)} EGP</span>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleClearCart}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="bg-green-800 hover:bg-green-900"
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
        <DialogContent className="sm:max-w-2xl">
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
