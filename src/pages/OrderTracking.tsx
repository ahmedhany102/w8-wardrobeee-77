
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Package2, Truck, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import OrderDatabase from '@/models/OrderDatabase';
import { Order } from '@/models/Order';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const OrderTracking = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const orderDb = OrderDatabase.getInstance();
      const userOrders = await orderDb.getUserOrders(user.email);
      
      // Sort orders by date (newest first)
      const sortedOrders = userOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load your orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  // Filter orders by status
  const activeOrders = orders.filter(order => 
    order.status === 'PENDING' || 
    order.status === 'PROCESSING' || 
    order.status === 'SHIPPED'
  );
  
  const completedOrders = orders.filter(order => 
    order.status === 'DELIVERED'
  );
  
  const cancelledOrders = orders.filter(order => 
    order.status === 'CANCELLED'
  );
  
  // All historical orders (completed or cancelled)
  const historyOrders = [...completedOrders, ...cancelledOrders];

  // Get icon based on order status
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'DELIVERED': return <CheckCircle className="text-green-500" />;
      case 'CANCELLED': return <XCircle className="text-red-500" />;
      case 'SHIPPED': return <Truck className="text-blue-500" />;
      case 'PROCESSING': return <Package2 className="text-yellow-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };
  
  const getOrderStatusText = (status: string) => {
    switch(status) {
      case 'PENDING': return 'Order received';
      case 'PROCESSING': return 'Preparing your order';
      case 'SHIPPED': return 'Order on the way';
      case 'DELIVERED': return 'Order delivered';
      case 'CANCELLED': return 'Order cancelled';
      default: return 'Unknown status';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Track Your Orders</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package2 className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No Orders Found</h3>
              <p className="text-gray-500 mt-2 text-center">You haven't placed any orders yet.</p>
              <Button 
                className="mt-6 bg-green-700 hover:bg-green-800"
                onClick={() => window.location.href = '/'}
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs defaultValue="active" className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="bg-green-800 text-white mb-4">
                  <TabsTrigger value="active" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">Active Orders</TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">Order History</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="active" className="space-y-4">
                {activeOrders.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <p className="text-gray-500">No active orders at the moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {activeOrders.map((order) => (
                        <CarouselItem key={order.id} className="md:basis-1/2 lg:basis-1/3">
                          <Card className="h-full">
                            <CardHeader className={`${getStatusColor(order.status)} rounded-t-lg`}>
                              <div className="flex justify-between items-center">
                                <CardTitle>Order #{order.orderNumber}</CardTitle>
                                {getStatusIcon(order.status)}
                              </div>
                              <CardDescription className="text-black font-medium">
                                {getOrderStatusText(order.status)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="py-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Date:</span>
                                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Items:</span>
                                  <span>{order.items.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Total:</span>
                                  <span className="font-semibold">{order.totalAmount.toFixed(2)} EGP</span>
                                </div>
                              </div>
                              
                              <div className="mt-4 border-t pt-4">
                                <h4 className="text-sm font-medium mb-2">Order Status</h4>
                                <div className="relative">
                                  <div className="flex items-center mb-4">
                                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status !== 'CANCELLED' ? 'bg-green-500' : 'bg-gray-300'}`}>
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="ml-2">
                                      <p className="text-xs font-medium">Order Received</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center mb-4">
                                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}>
                                      <Package2 className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="ml-2">
                                      <p className="text-xs font-medium">Processing</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center mb-4">
                                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}>
                                      <Truck className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="ml-2">
                                      <p className="text-xs font-medium">Shipped</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'}`}>
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="ml-2">
                                      <p className="text-xs font-medium">Delivered</p>
                                    </div>
                                  </div>
                                  
                                  <div className="absolute left-2.5 top-0 h-full w-0.5 bg-gray-200 -z-10"></div>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="border-t pt-2">
                              <Button variant="ghost" onClick={() => handleViewDetails(order)} className="w-full">
                                View Details <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                {historyOrders.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <p className="text-gray-500">No order history found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {historyOrders.map((order) => (
                      <Card key={order.id}>
                        <CardHeader className={`${getStatusColor(order.status)}`}>
                          <div className="flex justify-between items-center">
                            <CardTitle>Order #{order.orderNumber}</CardTitle>
                            {getStatusIcon(order.status)}
                          </div>
                          <CardDescription className="text-black font-medium">
                            {getOrderStatusText(order.status)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="py-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Date:</span>
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Items:</span>
                              <span>{order.items.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Total:</span>
                              <span className="font-semibold">{order.totalAmount.toFixed(2)} EGP</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-1">
                            <h4 className="text-sm font-medium">Products:</h4>
                            <ul className="list-disc list-inside text-xs text-gray-600">
                              {order.items.slice(0, 3).map((item, index) => (
                                <li key={index} className="truncate">
                                  {item.productName} x {item.quantity}
                                </li>
                              ))}
                              {order.items.length > 3 && <li>+ {order.items.length - 3} more items</li>}
                            </ul>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-2">
                          <Button variant="ghost" onClick={() => handleViewDetails(order)} className="w-full">
                            View Details <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Order #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Order Status</p>
                  <div>
                    <Badge className={getStatusColor(selectedOrder.status)} variant="outline">
                      {getOrderStatusText(selectedOrder.status)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Order Date</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-lg mb-2">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-500">x{item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.totalPrice.toFixed(2)} EGP</div>
                        <div className="text-xs text-gray-500">{item.unitPrice.toFixed(2)} EGP each</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center font-medium text-lg mt-4">
                  <span>Total:</span>
                  <span>{selectedOrder.totalAmount.toFixed(2)} EGP</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-lg mb-2">Shipping Address</h3>
                <p>{selectedOrder.customerInfo.address.street}</p>
                <p>{selectedOrder.customerInfo.address.city}, {selectedOrder.customerInfo.address.zipCode}</p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-lg mb-2">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p>{selectedOrder.paymentInfo?.method || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                    <Badge variant={
                      selectedOrder.paymentStatus === 'PAID' ? 'success' : 
                      selectedOrder.paymentStatus === 'FAILED' ? 'destructive' : 
                      'warning'
                    }>
                      {selectedOrder.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-lg mb-2">Additional Notes</h3>
                  <p className="text-gray-700 italic">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default OrderTracking;
