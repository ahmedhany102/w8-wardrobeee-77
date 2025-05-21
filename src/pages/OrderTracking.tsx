import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Order } from '@/models/Order';
import OrderDatabase from '@/models/OrderDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

const OrderTracking = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const orderDb = OrderDatabase.getInstance();
      const userOrders = await orderDb.getOrdersByCustomerEmail(user?.email || '');
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const orderDb = OrderDatabase.getInstance();
      await orderDb.cancelOrder(orderId);
      
      // Update the local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      ));
      
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return order.status !== 'CANCELLED';
    } else {
      return order.status === 'CANCELLED';
    }
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>
        
        <Tabs 
          defaultValue="active" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled Orders</TabsTrigger>
          </TabsList>

          {['active', 'cancelled'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-lg text-gray-500 mb-4">
                    {tab === 'active' ? "You don't have any active orders" : "You don't have any cancelled orders"}
                  </p>
                  {tab === 'active' && (
                    <Button 
                      onClick={() => window.location.href = '/'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Shop Now
                    </Button>
                  )}
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 py-3">
                      <div className="flex flex-wrap justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">Order #: {order.orderNumber}</CardTitle>
                          <CardDescription>
                            {formatDate(order.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status === 'PENDING' && 'Pending'}
                            {order.status === 'PROCESSING' && 'Processing'}
                            {order.status === 'SHIPPED' && 'Shipped'}
                            {order.status === 'DELIVERED' && 'Delivered'}
                            {order.status === 'CANCELLED' && 'Cancelled'}
                          </Badge>
                          <span className="text-sm font-medium">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">
                            {order.items.length} {order.items.length > 1 ? 'products' : 'product'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            View Details
                          </Button>
                          
                          {order.status === 'PENDING' && (
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Order Details #{selectedOrder?.orderNumber}</span>
              <button 
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              {/* Order Status */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Order Date:</h3>
                  <p>{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status === 'PENDING' && 'Pending'}
                  {selectedOrder.status === 'PROCESSING' && 'Processing'}
                  {selectedOrder.status === 'SHIPPED' && 'Shipped'}
                  {selectedOrder.status === 'DELIVERED' && 'Delivered'}
                  {selectedOrder.status === 'CANCELLED' && 'Cancelled'}
                </Badge>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-medium mb-2">Shipping Address:</h3>
                <div className="bg-gray-50 p-3 rounded text-gray-700">
                  <p>{selectedOrder.customerInfo.name}</p>
                  <p>{selectedOrder.customerInfo.phone}</p>
                  <p>
                    {selectedOrder.customerInfo.address.street}, {" "}
                    {selectedOrder.customerInfo.address.city}, {" "}
                    {selectedOrder.customerInfo.address.zipCode}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-2">Products:</h3>
                <div className="border rounded overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Specifications
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                              {item.productName}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                              {(item.color || item.size) ? (
                                <>
                                  {item.color && <span>Color: {item.color}</span>}
                                  {item.color && item.size && <span> / </span>}
                                  {item.size && <span>Size: {item.size}</span>}
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                              ${item.unitPrice.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center py-2">
                  <span>Total:</span>
                  <span className="font-medium">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Payment Method:</span>
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default OrderTracking;
