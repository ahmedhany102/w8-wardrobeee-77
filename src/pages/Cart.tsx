
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash, Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import CartDatabase, { CartItem } from '@/models/CartDatabase';
import { OrderDatabase } from '@/models/OrderDatabase';

type PaymentMethod = "CASH" | "CREDIT_CARD" | "WALLET" | "BANK_TRANSFER";

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch cart items on component mount
  useEffect(() => {
    loadCartItems();
    
    // Pre-fill shipping info if user is logged in
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  
  const loadCartItems = async () => {
    setLoading(true);
    try {
      const cartDb = CartDatabase.getInstance();
      const items = await cartDb.getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error("Error loading cart items:", error);
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      const cartDb = CartDatabase.getInstance();
      await cartDb.updateQuantity(itemId, newQuantity);
      loadCartItems();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };
  
  const handleRemoveItem = async (itemId: string) => {
    try {
      const cartDb = CartDatabase.getInstance();
      await cartDb.removeFromCart(itemId);
      toast.success("Item removed from cart");
      loadCartItems();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };
  
  const handleClearCart = async () => {
    try {
      const cartDb = CartDatabase.getInstance();
      await cartDb.clearCart();
      toast.success("Cart cleared");
      loadCartItems();
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };
  
  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateShippingInfo = () => {
    if (!shippingInfo.name.trim()) return "Name is required";
    if (!shippingInfo.email.trim() || !shippingInfo.email.includes('@')) return "Valid email is required";
    if (!shippingInfo.phone.trim()) return "Phone number is required";
    if (!shippingInfo.street.trim()) return "Street address is required";
    if (!shippingInfo.city.trim()) return "City is required";
    return null;
  };
  
  const validatePaymentInfo = () => {
    if (paymentMethod === "CREDIT_CARD") {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) return "Valid card number is required";
      if (!cardDetails.cardName.trim()) return "Cardholder name is required";
      if (!cardDetails.expiry.trim() || !cardDetails.expiry.includes('/')) return "Valid expiry date is required (MM/YY)";
      if (!cardDetails.cvv.trim() || cardDetails.cvv.length < 3) return "Valid CVV is required";
    }
    return null;
  };
  
  const handleContinueToShipping = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    setCheckoutStep('shipping');
    window.scrollTo(0, 0);
  };
  
  const handleContinueToPayment = () => {
    const error = validateShippingInfo();
    if (error) {
      toast.error(error);
      return;
    }
    
    setCheckoutStep('payment');
    window.scrollTo(0, 0);
  };
  
  const handleGoBack = () => {
    if (checkoutStep === 'shipping') {
      setCheckoutStep('cart');
    } else if (checkoutStep === 'payment') {
      setCheckoutStep('shipping');
    }
    window.scrollTo(0, 0);
  };
  
  const handlePlaceOrder = async () => {
    const shippingError = validateShippingInfo();
    if (shippingError) {
      toast.error(shippingError);
      setCheckoutStep('shipping');
      return;
    }
    
    const paymentError = validatePaymentInfo();
    if (paymentError) {
      toast.error(paymentError);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate total price
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create order in database
      const orderDb = OrderDatabase.getInstance();
      
      // Build order payload
      const orderData = {
        customerInfo: {
          name: shippingInfo.name,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: {
            street: shippingInfo.street,
            city: shippingInfo.city,
            zipCode: shippingInfo.zipCode
          }
        },
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          imageUrl: item.imageUrl
        })),
        totalAmount,
        status: "PENDING" as const,
        paymentStatus: paymentMethod === "CASH" ? "PENDING" : "PAID" as const, 
        paymentInfo: {
          method: paymentMethod,
          ...(paymentMethod === "CREDIT_CARD" && {
            cardLast4: cardDetails.cardNumber.slice(-4),
            cardBrand: getCardBrand(cardDetails.cardNumber),
            transactionId: `TXN-${Date.now()}`
          })
        },
        notes: shippingInfo.notes
      };
      
      // Save order
      const orderId = await orderDb.createOrder(orderData);
      
      if (orderId) {
        // Clear cart
        const cartDb = CartDatabase.getInstance();
        await cartDb.clearCart();
        
        // Show success message
        toast.success("Order placed successfully!");
        
        // Redirect to order tracking
        navigate(`/tracking?orderId=${orderId}`);
      } else {
        toast.error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to determine card brand
  const getCardBrand = (number: string): string => {
    // Simple card brand detection based on first digit
    const firstDigit = number[0];
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'American Express';
    return 'Card';
  };
  
  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 0 ? 30 : 0; // Free shipping over $100
  const total = subtotal + shippingCost;
  
  const renderCartItems = () => (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              <TableHead className="w-[100px]">Product</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img 
                      src={item.imageUrl || 'https://via.placeholder.com/60?text=Product'} 
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/60?text=Product';
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.price.toFixed(2)} EGP</TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100"
                        onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 bg-transparent hover:bg-gray-100"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(item.price * item.quantity).toFixed(2)} EGP
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-transparent"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-gray-500">Your cart is empty</span>
                    <Button 
                      className="mt-4 bg-green-800 hover:bg-green-900" 
                      onClick={() => navigate('/')}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {cartItems.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="text-red-500 hover:text-red-700 border-red-200"
            onClick={handleClearCart}
          >
            Clear Cart
          </Button>
        </div>
      )}
    </div>
  );
  
  const renderOrderSummary = () => (
    <Card className="bg-gray-50 border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium">{subtotal.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-medium">{shippingCost.toFixed(2)} EGP</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">{total.toFixed(2)} EGP</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {checkoutStep === 'cart' && (
          <Button 
            className="w-full bg-green-800 hover:bg-green-900" 
            disabled={cartItems.length === 0}
            onClick={handleContinueToShipping}
          >
            Proceed to Checkout
          </Button>
        )}
        
        {checkoutStep === 'shipping' && (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleGoBack}
            >
              Back to Cart
            </Button>
            <Button 
              className="flex-1 bg-green-800 hover:bg-green-900"
              onClick={handleContinueToPayment}
            >
              Continue to Payment
            </Button>
          </div>
        )}
        
        {checkoutStep === 'payment' && (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleGoBack}
            >
              Back
            </Button>
            <Button 
              className="flex-1 bg-green-800 hover:bg-green-900"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
  
  const renderShippingForm = () => (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
        <CardTitle className="text-lg">Shipping Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              id="name"
              name="name"
              value={shippingInfo.name}
              onChange={handleShippingInfoChange}
              className="w-full"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={shippingInfo.email}
              onChange={handleShippingInfoChange}
              className="w-full"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
            <Input
              id="phone"
              name="phone"
              value={shippingInfo.phone}
              onChange={handleShippingInfoChange}
              className="w-full"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium mb-1">Street Address</label>
            <Input
              id="street"
              name="street"
              value={shippingInfo.street}
              onChange={handleShippingInfoChange}
              className="w-full"
              placeholder="Enter your street address"
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
            <Input
              id="city"
              name="city"
              value={shippingInfo.city}
              onChange={handleShippingInfoChange}
              className="w-full"
              placeholder="Enter your city"
            />
          </div>
          
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium mb-1">ZIP / Postal Code</label>
            <Input
              id="zipCode"
              name="zipCode"
              value={shippingInfo.zipCode}
              onChange={handleShippingInfoChange}
              className="w-full"
              placeholder="Enter ZIP code"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium mb-1">Order Notes (Optional)</label>
            <Textarea
              id="notes"
              name="notes"
              value={shippingInfo.notes}
              onChange={handleShippingInfoChange}
              className="w-full"
              placeholder="Special instructions for delivery"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderPaymentForm = () => (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
        <CardTitle className="text-lg">Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "CASH"}
                onChange={() => setPaymentMethod("CASH")}
                className="form-radio h-4 w-4 text-green-800 focus:ring-green-800"
              />
              <span>Cash on Delivery</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "CREDIT_CARD"}
                onChange={() => setPaymentMethod("CREDIT_CARD")}
                className="form-radio h-4 w-4 text-green-800 focus:ring-green-800"
              />
              <span>Credit Card</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "WALLET"}
                onChange={() => setPaymentMethod("WALLET")}
                className="form-radio h-4 w-4 text-green-800 focus:ring-green-800"
              />
              <span>Digital Wallet</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
                className="form-radio h-4 w-4 text-green-800 focus:ring-green-800"
              />
              <span>Bank Transfer</span>
            </label>
          </div>
          
          {paymentMethod === "CREDIT_CARD" && (
            <div className="mt-4 border-t pt-4 space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">Card Number</label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleCardDetailsChange}
                  className="w-full"
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                />
              </div>
              
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium mb-1">Cardholder Name</label>
                <Input
                  id="cardName"
                  name="cardName"
                  value={cardDetails.cardName}
                  onChange={handleCardDetailsChange}
                  className="w-full"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium mb-1">Expiry Date</label>
                  <Input
                    id="expiry"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardDetailsChange}
                    className="w-full"
                    placeholder="MM/YY"
                  />
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium mb-1">CVV</label>
                  <Input
                    id="cvv"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardDetailsChange}
                    className="w-full"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === "BANK_TRANSFER" && (
            <div className="mt-4 border-t pt-4">
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm">Bank Transfer Instructions:</p>
                <p className="text-sm mt-2">Please transfer the total amount to our bank account:</p>
                <p className="text-sm font-medium mt-1">Bank: W8 National Bank</p>
                <p className="text-sm font-medium">Account: 123456789</p>
                <p className="text-sm font-medium">IBAN: EG123456789</p>
                <p className="text-sm mt-2">Your order will be processed once payment is received.</p>
              </div>
            </div>
          )}
          
          {paymentMethod === "WALLET" && (
            <div className="mt-4 border-t pt-4">
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm">Available Digital Wallet Options:</p>
                <ul className="list-disc list-inside text-sm mt-2">
                  <li>Fawry Pay</li>
                  <li>Vodafone Cash</li>
                  <li>Orange Money</li>
                  <li>Etisalat Cash</li>
                </ul>
                <p className="text-sm mt-2">You'll receive payment instructions after placing your order.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold mb-6">
          {checkoutStep === 'cart' && 'Shopping Cart'}
          {checkoutStep === 'shipping' && 'Checkout - Shipping'}
          {checkoutStep === 'payment' && 'Checkout - Payment'}
        </h1>
        
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${checkoutStep === 'cart' ? 'bg-green-800 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${checkoutStep !== 'cart' ? 'bg-green-800' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${checkoutStep === 'shipping' ? 'bg-green-800 text-white' : checkoutStep === 'payment' ? 'bg-green-800 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <div className={`w-16 h-1 ${checkoutStep === 'payment' ? 'bg-green-800' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${checkoutStep === 'payment' ? 'bg-green-800 text-white' : 'bg-gray-200'}`}>
                3
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex text-sm">
              <span className="w-8 text-center"></span>
              <span className="w-32 text-center">Cart</span>
              <span className="w-32 text-center">Shipping</span>
              <span className="w-8 text-center"></span>
              <span className="w-32 text-center">Payment</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`md:col-span-2 ${checkoutStep !== 'cart' ? 'hidden md:block' : ''}`}>
              {renderCartItems()}
            </div>
            
            {checkoutStep === 'shipping' && (
              <div className="md:col-span-2">
                {renderShippingForm()}
              </div>
            )}
            
            {checkoutStep === 'payment' && (
              <div className="md:col-span-2">
                {renderPaymentForm()}
              </div>
            )}
            
            <div className="md:col-span-1">
              {renderOrderSummary()}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
