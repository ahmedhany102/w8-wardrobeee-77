
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/models/Order";
import OrderDatabase from "@/models/OrderDatabase";
import { toast } from "sonner";

// Order status badge color map
const statusColorMap: Record<Order['status'], string> = {
  'pending': 'bg-yellow-500',
  'processing': 'bg-blue-500',
  'shipped': 'bg-purple-500',
  'delivered': 'bg-green-500',
  'cancelled': 'bg-red-500'
};

// Payment status badge color map
const paymentStatusColorMap: Record<Order['paymentStatus'], string> = {
  'paid': 'bg-green-500',
  'unpaid': 'bg-red-500',
  'refunded': 'bg-yellow-500'
};

const OrdersPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const orderDb = OrderDatabase.getInstance();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await orderDb.getAllOrders();
      setOrders(allOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    setViewOrder(order);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updatedOrder = await orderDb.updateOrderStatus(orderId, status);
      if (updatedOrder) {
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        
        // If the dialog is open with this order, update it
        if (viewOrder && viewOrder.id === orderId) {
          setViewOrder({ ...viewOrder, status });
        }
        
        toast.success(`Order status updated to ${status}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    try {
      const updatedOrder = await orderDb.updatePaymentStatus(orderId, paymentStatus);
      if (updatedOrder) {
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, paymentStatus } : order
        ));
        
        // If the dialog is open with this order, update it
        if (viewOrder && viewOrder.id === orderId) {
          setViewOrder({ ...viewOrder, paymentStatus });
        }
        
        toast.success(`Payment status updated to ${paymentStatus}`);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <Card className="mb-8 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-t-md">
        <CardTitle className="text-2xl flex items-center gap-2">
          Customer Orders
        </CardTitle>
        <CardDescription className="text-gray-100">
          View and manage all customer orders
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-700">Order Management</h2>
          <Button 
            onClick={fetchOrders} 
            variant="outline"
            className="border-purple-300 hover:bg-purple-50 transition-all"
          >
            Refresh Orders
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden transition-all duration-300">
            <Table>
              <TableHeader className="bg-purple-100">
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-purple-50 transition-colors">
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.customerInfo.name}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColorMap[order.status]} text-white`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${paymentStatusColorMap[order.paymentStatus]} text-white`}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrderDetails(order)}
                          className="border-purple-300 hover:bg-purple-50 transition-all"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-purple-700">
              Order Details - {viewOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>
          
          {viewOrder && (
            <div className="space-y-6">
              {/* Order Status Section */}
              <div className="flex flex-wrap gap-3 justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={`${statusColorMap[viewOrder.status]} text-white`}>
                      {viewOrder.status}
                    </Badge>
                    <select 
                      className="text-sm border rounded p-1"
                      value={viewOrder.status}
                      onChange={(e) => handleUpdateStatus(viewOrder.id, e.target.value as Order['status'])}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={`${paymentStatusColorMap[viewOrder.paymentStatus]} text-white`}>
                      {viewOrder.paymentStatus}
                    </Badge>
                    <select 
                      className="text-sm border rounded p-1"
                      value={viewOrder.paymentStatus}
                      onChange={(e) => handleUpdatePaymentStatus(viewOrder.id, e.target.value as Order['paymentStatus'])}
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                  <p className="mt-1">{formatDate(viewOrder.createdAt)}</p>
                </div>
              </div>
              
              {/* Customer Information */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-purple-700 mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Name:</span> {viewOrder.customerInfo.name}</p>
                    <p><span className="font-medium">Email:</span> {viewOrder.customerInfo.email}</p>
                    <p><span className="font-medium">Phone:</span> {viewOrder.customerInfo.phone}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Address:</span></p>
                    <address className="not-italic">
                      {viewOrder.customerInfo.address.street}<br />
                      {viewOrder.customerInfo.address.city}, {viewOrder.customerInfo.address.state} {viewOrder.customerInfo.address.zip}<br />
                      {viewOrder.customerInfo.address.country}
                    </address>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-purple-700 mb-2">Order Items</h3>
                <Table>
                  <TableHeader className="bg-purple-50">
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2}></TableCell>
                      <TableCell className="font-bold">Subtotal</TableCell>
                      <TableCell className="text-right">
                        ${viewOrder.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}></TableCell>
                      <TableCell className="font-bold">Shipping</TableCell>
                      <TableCell className="text-right">${viewOrder.shippingCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}></TableCell>
                      <TableCell className="font-bold text-lg">Total</TableCell>
                      <TableCell className="text-right font-bold text-lg">${viewOrder.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {/* Payment & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <h3 className="font-semibold text-purple-700 mb-2">Payment Information</h3>
                  <p><span className="font-medium">Method:</span> {viewOrder.paymentMethod}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-700 mb-2">Shipping Information</h3>
                  <p><span className="font-medium">Method:</span> {viewOrder.shippingMethod}</p>
                </div>
              </div>
              
              {/* Order Notes */}
              {viewOrder.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-purple-700 mb-2">Order Notes</h3>
                  <p className="bg-gray-50 p-3 rounded-md">{viewOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OrdersPanel;
