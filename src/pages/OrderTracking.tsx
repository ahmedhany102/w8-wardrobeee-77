
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Package, Check, Clock, X, Truck } from 'lucide-react';
import OrderDatabase from '@/models/OrderDatabase';
import { Order } from '@/models/Order';

const OrderTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const orderDb = OrderDatabase.getInstance();
        const userOrders = await orderDb.getOrdersByCustomerId(user.id);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'PROCESSING':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-green-500" />;
      case 'DELIVERED':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SHIPPED': 
        return 'bg-green-100 text-green-800 border-green-300';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStepProgress = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  const renderProgressBar = (status: Order['status']) => {
    const progress = getStepProgress(status);
    if (progress === -1) return null; // Don't show progress for cancelled orders
    
    return (
      <div className="w-full mt-4 mb-2">
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${progress * 25}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span className={`${progress >= 1 ? 'text-green-600 font-medium' : ''}`}>Confirmed</span>
            <span className={`${progress >= 2 ? 'text-green-600 font-medium' : ''}`}>Processing</span>
            <span className={`${progress >= 3 ? 'text-green-600 font-medium' : ''}`}>Shipped</span>
            <span className={`${progress >= 4 ? 'text-green-600 font-medium' : ''}`}>Delivered</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-green-500">Your Orders</h1>
        
        {orders.length === 0 ? (
          <Card className="border border-green-800 bg-black text-white">
            <CardHeader>
              <CardTitle>No orders found</CardTitle>
              <CardDescription className="text-gray-400">
                You haven't placed any orders yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button 
                onClick={() => navigate('/')}
                className="py-2 px-4 bg-green-800 text-white rounded-md hover:bg-green-700 transition-all"
              >
                Browse Products
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border border-green-800 bg-black text-white overflow-hidden">
                <CardHeader className="border-b border-green-900 bg-gradient-to-r from-green-900 to-black">
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <CardTitle className="text-xl">Order #{order.orderNumber}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <Badge className={`${getStatusBadgeClass(order.status)} border`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  {renderProgressBar(order.status)}
                  
                  <Tabs defaultValue="items" className="w-full mt-4">
                    <TabsList className="bg-green-900/30 border border-green-800 grid grid-cols-3 mb-4">
                      <TabsTrigger value="items">Items</TabsTrigger>
                      <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
                      <TabsTrigger value="payment">Payment</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="items" className="space-y-4">
                      <div className="rounded-md overflow-hidden border border-green-900">
                        <table className="min-w-full divide-y divide-green-900">
                          <thead className="bg-green-900/30">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Qty</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody className="bg-black divide-y divide-green-900">
                            {order.items.map((item, index) => (
                              <tr key={index} className="hover:bg-green-900/10">
                                <td className="px-4 py-3">{item.productName}</td>
                                <td className="px-4 py-3">{item.quantity}</td>
                                <td className="px-4 py-3">{item.unitPrice.toFixed(2)} EGP</td>
                                <td className="px-4 py-3">{item.totalPrice.toFixed(2)} EGP</td>
                              </tr>
                            ))}
                            <tr className="bg-green-900/20">
                              <td colSpan={3} className="px-4 py-3 text-right font-bold">Total:</td>
                              <td className="px-4 py-3 font-bold">{order.totalAmount.toFixed(2)} EGP</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="shipping" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-green-900 rounded-md bg-green-900/10">
                          <h3 className="text-lg font-medium mb-2 text-green-400">Shipping Address</h3>
                          <p className="mb-1">{order.customerInfo.name}</p>
                          <p className="mb-1">{order.customerInfo.address.street}</p>
                          <p className="mb-1">
                            {order.customerInfo.address.city}, {order.customerInfo.address.state} {order.customerInfo.address.zipCode}
                          </p>
                          <p className="mb-1">{order.customerInfo.address.country}</p>
                        </div>
                        
                        <div className="p-4 border border-green-900 rounded-md bg-green-900/10">
                          <h3 className="text-lg font-medium mb-2 text-green-400">Contact Information</h3>
                          <p className="mb-1">Email: {order.customerInfo.email}</p>
                          <p className="mb-1">Phone: {order.customerInfo.phone}</p>
                        </div>
                      </div>
                      
                      {order.notes && (
                        <div className="p-4 border border-green-900 rounded-md bg-green-900/10">
                          <h3 className="text-lg font-medium mb-2 text-green-400">Order Notes</h3>
                          <p>{order.notes}</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="payment" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-green-900 rounded-md bg-green-900/10">
                          <h3 className="text-lg font-medium mb-2 text-green-400">Payment Method</h3>
                          <p className="mb-1">Method: {order.paymentInfo?.method || 'N/A'}</p>
                          {order.paymentInfo?.cardLast4 && (
                            <p className="mb-1">Card: **** **** **** {order.paymentInfo.cardLast4}</p>
                          )}
                          {order.paymentInfo?.cardBrand && (
                            <p className="mb-1">Card Type: {order.paymentInfo.cardBrand}</p>
                          )}
                        </div>
                        
                        <div className="p-4 border border-green-900 rounded-md bg-green-900/10">
                          <h3 className="text-lg font-medium mb-2 text-green-400">Payment Status</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={`
                              ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 border-green-300' : 
                                order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800 border-red-300' : 
                                'bg-gray-100 text-gray-800 border-gray-300'} border`}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderTracking;
