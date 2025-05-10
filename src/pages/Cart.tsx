
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ShoppingCart, Trash, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
  }, []);

  const updateCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleIncreaseQuantity = (productId: number) => {
    const updatedCart = cartItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    updateCart(updatedCart);
  };

  const handleDecreaseQuantity = (productId: number) => {
    const updatedCart = cartItems.map(item =>
      item.product.id === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ).filter(item => item.quantity > 0);
    updateCart(updatedCart);
  };

  const handleRemoveItem = (productId: number) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    updateCart(updatedCart);
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const handleCheckout = () => {
    setIsCheckoutModalOpen(true);
  };

  const processOrder = () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setIsCheckoutModalOpen(false);
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/");
    }, 1500);
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
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Shopping Cart
              </span>
            </CardTitle>
            {!isCartEmpty && (
              <Button variant="outline" onClick={() => {
                if (confirm("Are you sure you want to clear your cart?")) {
                  clearCart();
                  toast.success("Cart has been cleared");
                }
              }}>
                Clear Cart
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isCartEmpty ? (
              <div className="flex flex-col items-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-xl text-gray-500 mb-6">Your cart is empty</p>
                <Button onClick={() => navigate("/")}>Browse Products</Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
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
                        <TableRow key={item.product.id}>
                          <TableCell>
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.product.name}
                          </TableCell>
                          <TableCell>${item.product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDecreaseQuantity(item.product.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleIncreaseQuantity(item.product.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500"
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
                  <div className="text-xl font-semibold mb-4 md:mb-0">
                    Total: ${totalPrice.toFixed(2)}
                  </div>
                  <Button onClick={handleCheckout} className="w-full md:w-auto">
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Review your order before proceeding with payment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-t border-b py-4">
              <p className="font-medium mb-2">Order Summary</p>
              {cartItems.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm py-1">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between font-bold">
              <span>Total Amount</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            
            <p className="text-sm text-gray-500">
              This is a demo checkout. No real payment will be processed.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processOrder} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Complete Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Cart;
