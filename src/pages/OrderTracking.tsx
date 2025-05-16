
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import OrderDatabase from '@/models/OrderDatabase';
import { Order } from '@/models/Order';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OrderTracking = () => {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('track');
  
  const handleTrackOrder = async () => {
    if (!orderNumber.trim()) {
      toast.error("Please enter an order number");
      return;
    }
    
    setIsLoading(true);
    setOrder(null);
    
    try {
      const orderDb = OrderDatabase.getInstance();
      const foundOrder = await orderDb.getOrderByOrderNumber(orderNumber);
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        toast.error("Order not found. Please check your order number.");
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      toast.error("Failed to track order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadUserOrders = async () => {
    if (!user || !user.email) {
      toast.error("Please login to view your orders");
      return;
    }
    
    setIsLoading(true);
    try {
      const orderDb = OrderDatabase.getInstance();
      const orders = await orderDb.getOrdersByCustomerEmail(user.email);
      setUserOrders(orders);
      
      if (orders.length === 0) {
        toast.info("You haven't placed any orders yet");
      }
    } catch (error) {
      console.error("Error loading user orders:", error);
      toast.error("Failed to load your orders");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'history' && user && userOrders.length === 0) {
      loadUserOrders();
    }
  };
  
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Track Your Order</h1>
        
        {user ? (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="track">Track Order</TabsTrigger>
              <TabsTrigger value="history">Your Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="track">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Your Order Number</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Order Number (e.g., EG-123456)"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleTrackOrder} 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Tracking...' : 'Track'}
                    </Button>
                  </div>
                  
                  {order && (
                    <div className="mt-8 border rounded-md p-4">
                      <h3 className="text-xl font-semibold mb-2">Order #{order.orderNumber}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Date Ordered</p>
                          <p>{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-semibold">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 mb-4">
                        <h4 className="font-semibold mb-2">Shipping Details</h4>
                        <p>{order.customerInfo.name}</p>
                        <p>{order.customerInfo.address.street}</p>
                        <p>{order.customerInfo.address.city}</p>
                        <p>{order.customerInfo.phone}</p>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.productName} × {item.quantity}</span>
                              <span className="font-medium">{item.totalPrice} EGP</span>
                            </div>
                          ))}
                          <div className="flex justify-between border-t pt-2 font-semibold">
                            <span>Total</span>
                            <span>{order.totalAmount} EGP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Your Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2">Loading your orders...</p>
                    </div>
                  ) : userOrders.length > 0 ? (
                    <div className="space-y-4">
                      {userOrders.map(order => (
                        <div key={order.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between mb-2">
                            <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                          <p className="text-sm mt-1">{order.items.length} items · Total: {order.totalAmount} EGP</p>
                          
                          <div className="mt-2 flex justify-between items-center">
                            <Button variant="link" size="sm" onClick={() => {
                              setOrderNumber(order.orderNumber);
                              setOrder(order);
                              setActiveTab('track');
                            }}>View Details</Button>
                            
                            {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={async () => {
                                  try {
                                    const orderDb = OrderDatabase.getInstance();
                                    await orderDb.cancelOrder(order.id);
                                    await loadUserOrders(); // Refresh orders
                                    toast.success("Order cancelled successfully");
                                  } catch (error) {
                                    toast.error("Failed to cancel order");
                                    console.error(error);
                                  }
                                }}
                              >
                                Cancel Order
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p>You haven't placed any orders yet.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => window.location.href = '/'}
                      >
                        Browse Products
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Order Number</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Order Number (e.g., EG-123456)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTrackOrder} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Tracking...' : 'Track'}
                </Button>
              </div>
              
              {order && (
                <div className="mt-8 border rounded-md p-4">
                  <h3 className="text-xl font-semibold mb-2">Order #{order.orderNumber}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Date Ordered</p>
                      <p>{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-semibold">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-semibold mb-2">Shipping Details</h4>
                    <p>{order.customerInfo.name}</p>
                    <p>{order.customerInfo.address.street}</p>
                    <p>{order.customerInfo.address.city}</p>
                    <p>{order.customerInfo.phone}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.productName} × {item.quantity}</span>
                          <span className="font-medium">{item.totalPrice} EGP</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total</span>
                        <span>{order.totalAmount} EGP</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default OrderTracking;
