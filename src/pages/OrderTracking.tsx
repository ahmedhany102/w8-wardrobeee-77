
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/models/Order';
import OrderDatabase from '@/models/OrderDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ChevronRight, Package2, CircleDollarSign, MapPin, Phone, ClipboardList, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const OrderStatusColors: Record<Order['status'], string> = {
  "PENDING": "bg-orange-500",
  "PROCESSING": "bg-blue-500",
  "SHIPPED": "bg-purple-500",
  "DELIVERED": "bg-green-500",
  "CANCELLED": "bg-red-500"
};

const PaymentStatusColors: Record<Order['paymentStatus'], string> = {
  "PENDING": "bg-orange-500",
  "PAID": "bg-green-500",
  "FAILED": "bg-red-500",
  "REFUNDED": "bg-blue-500"
};

const OrderTracking: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);
  
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const orderDb = OrderDatabase.getInstance();
      // Using the correct method name
      const userOrders = await orderDb.getOrdersByCustomerEmail(user?.email || '');
      setOrders(userOrders);
      
      // Auto-select the first order if available
      if (userOrders.length > 0 && !selectedOrder) {
        setSelectedOrder(userOrders[0]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load your orders');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'DELIVERED';
    if (activeTab === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });
  
  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };
  
  const handleCancelOrder = async (orderId: string) => {
    try {
      const orderDb = OrderDatabase.getInstance();
      const updatedOrder = await orderDb.cancelOrder(orderId);
      
      if (updatedOrder) {
        // Update orders list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? updatedOrder : order
          )
        );
        
        // Update selected order if it was the one cancelled
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        
        toast.success('Order cancelled successfully');
      } else {
        toast.error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="w-full bg-gradient-to-r from-green-900 to-black flex justify-between mb-4">
              <TabsTrigger 
                value="all" 
                className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger 
                value="cancelled" 
                className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
              >
                Cancelled
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Order List */}
            <div className="lg:col-span-2 h-min">
              <Card className="h-full">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white py-3">
                  <CardTitle>Your Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-10">
                      <Package2 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium">No orders found</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {activeTab === 'all' 
                          ? "You haven't placed any orders yet." 
                          : `You don't have any ${activeTab} orders.`}
                      </p>
                      
                      <Button 
                        asChild
                        variant="outline" 
                        className="mt-4"
                      >
                        <a href="/">Browse Products</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y bg-background">
                      {filteredOrders.map((order) => (
                        <div 
                          key={order.id}
                          onClick={() => handleOrderSelect(order)}
                          className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">#{order.orderNumber}</span>
                              <div className="text-sm text-gray-500 mt-1">
                                {format(new Date(order.createdAt), 'PPP')}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Badge 
                                  className={`${OrderStatusColors[order.status]} text-white`}
                                >
                                  {order.status}
                                </Badge>
                                <Badge 
                                  className={`${PaymentStatusColors[order.paymentStatus]} text-white`}
                                >
                                  {order.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{order.totalAmount.toFixed(2)} EGP</div>
                              <div className="text-xs text-gray-500 mt-1">{order.items.length} items</div>
                              <ChevronRight className="h-5 w-5 text-gray-400 ml-auto mt-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Order Details */}
            <div className="lg:col-span-3">
              {selectedOrder ? (
                <Card className="h-full">
                  <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white py-3">
                    <CardTitle className="flex justify-between items-center">
                      <span>Order #{selectedOrder.orderNumber}</span>
                      <Badge 
                        className={`${OrderStatusColors[selectedOrder.status]} text-white`}
                      >
                        {selectedOrder.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Order Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Date Placed</div>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-green-600" />
                          <span className="text-sm">{format(new Date(selectedOrder.createdAt), 'PPP')}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Last Updated</div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-green-600" />
                          <span className="text-sm">{formatDistanceToNow(new Date(selectedOrder.updatedAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Amount</div>
                        <div className="flex items-center">
                          <CircleDollarSign className="h-3.5 w-3.5 mr-1 text-green-600" />
                          <span className="text-sm font-semibold">{selectedOrder.totalAmount.toFixed(2)} EGP</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Payment Status</div>
                        <div className="flex items-center">
                          <Badge 
                            className={`${PaymentStatusColors[selectedOrder.paymentStatus]} text-white text-xs`}
                          >
                            {selectedOrder.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Customer Info */}
                      <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <h3 className="font-medium">Customer Information</h3>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          <div>{selectedOrder.customerInfo.name}</div>
                          <div>{selectedOrder.customerInfo.email}</div>
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-gray-600" />
                            {selectedOrder.customerInfo.phone}
                          </div>
                        </div>
                      </div>
                      
                      {/* Address Info */}
                      <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <h3 className="font-medium">Shipping Address</h3>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          <div className="flex items-start">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-600 mt-0.5" />
                            <div>
                              <div>{selectedOrder.customerInfo.address.street}</div>
                              <div>{selectedOrder.customerInfo.address.city}, {selectedOrder.customerInfo.address.zipCode}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Info */}
                    {selectedOrder.paymentInfo && (
                      <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <h3 className="font-medium">Payment Information</h3>
                        <div className="text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-gray-500">Method:</span>{" "}
                              <span className="font-medium">{selectedOrder.paymentInfo.method}</span>
                            </div>
                            {selectedOrder.paymentInfo.cardBrand && (
                              <div>
                                <span className="text-gray-500">Card:</span>{" "}
                                <span className="font-medium">{selectedOrder.paymentInfo.cardBrand} **** {selectedOrder.paymentInfo.cardLast4}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Notes */}
                    {selectedOrder.notes && (
                      <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <h3 className="font-medium flex items-center">
                          <ClipboardList className="h-4 w-4 mr-1.5" />
                          Order Notes
                        </h3>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedOrder.notes}
                        </div>
                      </div>
                    )}
                    
                    {/* Order Items */}
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Order Items ({selectedOrder.items.length})</h3>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item) => (
                          <div 
                            key={item.productId} 
                            className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2"
                          >
                            <div className="flex items-center">
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.productName} 
                                  className="h-10 w-10 object-cover rounded-md mr-2"
                                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40' }}
                                />
                              )}
                              <div>
                                <div className="font-medium">{item.productName}</div>
                                <div className="text-xs text-gray-500">
                                  {item.quantity} x {item.unitPrice.toFixed(2)} EGP
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-medium">
                              {item.totalPrice.toFixed(2)} EGP
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex justify-between pt-2 font-bold">
                          <div>Total</div>
                          <div>{selectedOrder.totalAmount.toFixed(2)} EGP</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {['PENDING', 'PROCESSING'].includes(selectedOrder.status) && (
                      <div className="mt-4">
                        <Button 
                          variant="destructive"
                          className="w-full sm:w-auto"
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                    <Package2 className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-center mb-2">Select an order to view details</h3>
                    <p className="text-gray-500 text-center">
                      {filteredOrders.length > 0 
                        ? "Click on any order from the list to see full details."
                        : "You don't have any orders yet."}
                    </p>
                    
                    {filteredOrders.length === 0 && (
                      <Button 
                        asChild
                        variant="default" 
                        className="mt-6 bg-green-800 hover:bg-green-900"
                      >
                        <a href="/">Browse Products</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OrderTracking;
