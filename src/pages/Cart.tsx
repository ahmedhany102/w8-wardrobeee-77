
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShoppingCart, Trash, Plus, Minus, CreditCard, MapPin, Phone, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderDatabase from "@/models/OrderDatabase";
import { Order, CustomerInfo, OrderItem, PaymentInfo } from "@/models/Order";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@/models/Product";

interface CartItem {
  product: Product;
  quantity: number;
}

const orderSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  street: z.string().min(5, { message: "Please enter your street address" }),
  city: z.string().min(2, { message: "Please enter your city" }),
  state: z.string().min(2, { message: "Please enter your state/province" }),
  zip: z.string().min(3, { message: "Please enter your zip/postal code" }),
  country: z.string().min(2, { message: "Please enter your country" }),
  paymentMethod: z.enum(["creditCard", "paypal", "bankTransfer", "cashOnDelivery"], { 
    message: "Please select a payment method" 
  }),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVV: z.string().optional(),
  notes: z.string().optional()
});

type OrderFormValues = z.infer<typeof orderSchema>;

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const orderDb = OrderDatabase.getInstance();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      paymentMethod: "cashOnDelivery", // Default to cash on delivery
      notes: ""
    }
  });

  useEffect(() => {
    // Load cart from localStorage
    const cartJSON = localStorage.getItem('cart');
    if (cartJSON) {
      try {
        const parsedCart = JSON.parse(cartJSON);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Error parsing cart data:", error);
        setCartItems([]);
      }
    }
    
    // Add event listener for cart updates from other components
    const handleCartUpdate = () => {
      const updatedCartJSON = localStorage.getItem('cart');
      if (updatedCartJSON) {
        try {
          const updatedCart = JSON.parse(updatedCartJSON);
          setCartItems(updatedCart);
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

  const updateCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    // Dispatch event to update other components
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleIncreaseQuantity = (productId: string) => {
    const updatedCart = cartItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    updateCart(updatedCart);
  };

  const handleDecreaseQuantity = (productId: string) => {
    const updatedCart = cartItems.map(item =>
      item.product.id === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ).filter(item => item.quantity > 0);
    updateCart(updatedCart);
  };

  const handleRemoveItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    updateCart(updatedCart);
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCheckout = () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }
    
    if (user) {
      // Pre-fill the form with user email if available
      form.setValue("email", user.email);
      form.setValue("name", user.name || "");
    }
    
    setIsCheckoutModalOpen(true);
  };

  const processOrder = async (data: OrderFormValues) => {
    if (!user) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create OrderItems from cartItems with correct properties to match the OrderItem interface
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product.id.toString(), // Convert to string to match OrderItem interface
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity
      }));
      
      // Create customer info
      const customerInfo: CustomerInfo = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zip, // Using zipCode as per Address interface
          country: data.country
        }
      };
      
      // Calculate total amount
      const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const shippingCost = totalAmount > 100 ? 0 : 15; // Free shipping over $100
      
      // Create payment info
      const paymentInfo: PaymentInfo = {
        method: data.paymentMethod === "creditCard" ? "CREDIT_CARD" : 
               data.paymentMethod === "paypal" ? "WALLET" : 
               data.paymentMethod === "cashOnDelivery" ? "CASH" : "BANK_TRANSFER"
      };
      
      // Add card details if paying with credit card
      if (data.paymentMethod === "creditCard" && data.cardNumber) {
        paymentInfo.cardLast4 = data.cardNumber.slice(-4);
        paymentInfo.cardBrand = "Visa"; // Mock card brand
      }
      
      // Create order object
      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        orderNumber: `ORD-${Date.now().toString().substr(-6)}`,
        customerId: user.id,
        customerInfo,
        items: orderItems,
        totalAmount: totalAmount + shippingCost,
        status: "PENDING", // Use enum value as defined in Order interface
        paymentStatus: "PENDING", // Use enum value as defined in Order interface
        paymentInfo,
        notes: data.notes
      };
      
      // Save the order
      const savedOrder = await orderDb.saveOrder(orderData);
      
      // Simulate successful order
      setTimeout(() => {
        setIsProcessing(false);
        setIsCheckoutModalOpen(false);
        clearCart();
        toast.success("Order placed successfully!");
        navigate("/tracking");
      }, 1500);
      
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("There was an error processing your order. Please try again.");
      setIsProcessing(false);
    }
  };

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-4">Please Login to View Cart</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access your shopping cart.</p>
          <Button onClick={() => navigate("/login")} className="bg-green-800 hover:bg-green-900 interactive-button">Login</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
            <CardTitle className="text-2xl">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Shopping Cart
              </span>
            </CardTitle>
            {!isCartEmpty && (
              <Button variant="secondary" onClick={() => {
                if (confirm("Are you sure you want to clear your cart?")) {
                  clearCart();
                  toast.success("Cart has been cleared");
                }
              }}
              className="bg-white text-green-900 interactive-button"
              >
                Clear Cart
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {isCartEmpty ? (
              <div className="flex flex-col items-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-xl text-gray-500 mb-6">Your cart is empty</p>
                <Button 
                  onClick={() => navigate("/")} 
                  className="bg-green-800 hover:bg-green-900 transition-all animate-pulse interactive-button"
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden transition-all duration-300 hover:shadow-md">
                  <Table>
                    <TableHeader className="bg-green-100">
                      <TableRow>
                        <TableHead className="w-[100px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.product.id} className="hover:bg-green-50 transition-colors">
                          <TableCell>
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-16 w-16 object-contain rounded-md transition-all duration-300 hover:scale-110 product-image"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.product.name}
                          </TableCell>
                          <TableCell>{item.product.price.toFixed(2)} EGP</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-green-300 interactive-button"
                                onClick={() => handleDecreaseQuantity(item.product.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-green-300 interactive-button"
                                onClick={() => handleIncreaseQuantity(item.product.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {(item.product.price * item.quantity).toFixed(2)} EGP
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleRemoveItem(item.product.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
                  <div className="text-2xl font-semibold mb-4 md:mb-0 text-green-800">
                    Total: {totalPrice.toFixed(2)} EGP
                  </div>
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full md:w-auto bg-green-800 hover:bg-green-900 transition-all transform hover:scale-105 active:scale-95 interactive-button"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Order Form Modal */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-50 dark:bg-gray-900 border-green-800">
          <DialogHeader>
            <DialogTitle className="text-xl text-center text-green-800 dark:text-green-400">Complete Your Order</DialogTitle>
            <DialogDescription className="text-center dark:text-gray-300">
              Please provide your delivery and payment details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(processOrder)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="space-y-3 col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 dark:text-green-400">Personal Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" className="transition-all hover:border-green-300 bg-white dark:bg-gray-800" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="you@example.com" className="transition-all hover:border-green-300 bg-white dark:bg-gray-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-300">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+1 (234) 567-8900" className="transition-all hover:border-green-300 bg-white dark:bg-gray-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div className="space-y-3 col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 flex items-center gap-2 dark:text-green-400">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Shipping Address
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Street Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 Main St, Apt 4B" className="transition-all hover:border-green-300 bg-white dark:bg-gray-800" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-300">City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="New York" className="transition-all hover:border-green-300 bg-white dark:bg-gray-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-300">State/Province</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="NY" className="transition-all hover:border-green-300 bg-white dark:bg-gray-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-300">Zip/Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="10001" className="transition-all hover:border-green-300 bg-white dark:bg-gray-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-300">Country</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="United States" className="transition-all hover:border-green-300 bg-white dark:bg-gray-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Payment Details */}
                <div className="space-y-3 col-span-2">
                  <h3 className="text-lg font-medium border-b pb-2 flex items-center gap-2 dark:text-green-400">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Payment Details
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Payment Method</FormLabel>
                        <FormControl>
                          <select 
                            {...field} 
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all hover:border-green-300 bg-white dark:bg-gray-800 dark:text-gray-300"
                          >
                            <option value="cashOnDelivery">Cash on Delivery</option>
                            <option value="creditCard">Credit Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="bankTransfer">Bank Transfer</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Cash on Delivery Message */}
                  {form.watch("paymentMethod") === "cashOnDelivery" && (
                    <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-md border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-300">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                      <p>You'll pay in cash when your order is delivered. Please have the exact amount ready.</p>
                    </div>
                  )}
                  
                  {/* Credit Card Details (conditionally shown) */}
                  {form.watch("paymentMethod") === "creditCard" && (
                    <div className="space-y-3 animate-fade-in">
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-300">Card Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="1234 5678 9012 3456" 
                                className="transition-all hover:border-green-300 bg-white dark:bg-gray-800"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="cardExpiry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-300">Expiry Date</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="MM/YY" 
                                  className="transition-all hover:border-green-300 bg-white dark:bg-gray-800"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cardCVV"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-300">CVV</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="123" 
                                  className="transition-all hover:border-green-300 bg-white dark:bg-gray-800"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Additional Notes */}
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-300">Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any special instructions for delivery or order preparation" 
                            className="min-h-20 transition-all hover:border-green-300 bg-white dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <h3 className="text-lg font-medium mb-2 dark:text-green-400">Order Summary</h3>
                <div className="space-y-1">
                  {cartItems.map(item => (
                    <div key={item.product.id} className="flex justify-between text-sm py-1 dark:text-gray-300">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>{(item.product.price * item.quantity).toFixed(2)} EGP</span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold dark:text-white">
                    <span>Total Amount</span>
                    <span>{totalPrice.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="transition-all hover:bg-transparent dark:border-gray-700 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isProcessing}
                  className="bg-green-800 hover:bg-green-900 transition-transform hover:scale-105 active:scale-95 interactive-button"
                >
                  {isProcessing ? "Processing..." : "Complete Purchase"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Cart;
