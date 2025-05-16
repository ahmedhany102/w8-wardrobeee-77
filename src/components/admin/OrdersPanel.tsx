
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderDatabase from "@/models/OrderDatabase";
import { Order } from "@/models/Order";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const orderDb = OrderDatabase.getInstance();
      const allOrders = await orderDb.getAllOrders();
      setOrders(allOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (orderId: string, status: Order["status"]) => {
    try {
      const orderDb = OrderDatabase.getInstance();
      const updatedOrder = await orderDb.updateOrderStatus(orderId, status);
      
      if (updatedOrder) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
        
        toast.success("Order status updated");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentStatusChange = async (orderId: string, paymentStatus: Order["paymentStatus"]) => {
    try {
      const orderDb = OrderDatabase.getInstance();
      const updatedOrder = await orderDb.updatePaymentStatus(orderId, paymentStatus);
      
      if (updatedOrder) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, paymentStatus } : order
        ));
        
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus });
        }
        
        toast.success("Payment status updated");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "PENDING": return "warning";
      case "PROCESSING": return "info";
      case "SHIPPED": return "success";
      case "DELIVERED": return "success";
      case "CANCELLED": return "destructive";
      default: return "secondary";
    }
  };

  const getPaymentStatusBadgeVariant = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "PAID": return "success";
      case "PENDING": return "warning";
      case "FAILED": return "destructive";
      case "REFUNDED": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <CardContent className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-800">Orders Management</h2>
        <Button 
          onClick={fetchOrders} 
          variant="outline"
          className="border-green-500 hover:bg-green-50 transition-all"
        >
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No orders found</p>
          <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers make purchases</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden transition-all duration-300 hover:shadow-md">
          <Table>
            <TableHeader className="bg-green-100">
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-green-50 transition-colors">
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerInfo.name}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{order.totalAmount.toFixed(2)} EGP</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                      className="border-green-500 hover:bg-green-50 transition-all"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl text-green-800">Order Details</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Order #{selectedOrder?.orderNumber} - {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Customer Information */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-300 border-b border-green-200 dark:border-green-700 pb-2 mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-gray-900 dark:text-gray-100">{selectedOrder.customerInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-gray-100">{selectedOrder.customerInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-gray-100">{selectedOrder.customerInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {selectedOrder.customerInfo.address.street}, {selectedOrder.customerInfo.address.city}, {selectedOrder.customerInfo.address.zipCode}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300 border-b border-green-200 dark:border-green-700 pb-2 mb-4">Order Items</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-green-100 dark:bg-green-900/30">
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-gray-900 dark:text-gray-100">{item.productName}</TableCell>
                          <TableCell className="text-right text-gray-900 dark:text-gray-100">{item.quantity}</TableCell>
                          <TableCell className="text-right text-gray-900 dark:text-gray-100">{item.unitPrice.toFixed(2)} EGP</TableCell>
                          <TableCell className="text-right text-gray-900 dark:text-gray-100">{item.totalPrice.toFixed(2)} EGP</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-green-50 dark:bg-green-900/20">
                        <TableCell colSpan={3} className="text-right font-semibold text-gray-900 dark:text-gray-100">
                          Total Amount:
                        </TableCell>
                        <TableCell className="text-right font-bold text-gray-900 dark:text-gray-100">
                          {selectedOrder.totalAmount.toFixed(2)} EGP
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Payment Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 border-b border-green-200 dark:border-green-700 pb-2 mb-2">Payment Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</p>
                      <p className="text-gray-900 dark:text-gray-100">{selectedOrder.paymentInfo?.method || 'N/A'}</p>
                    </div>
                    {selectedOrder.paymentInfo?.cardLast4 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Card Details</p>
                        <p className="text-gray-900 dark:text-gray-100">{selectedOrder.paymentInfo.cardBrand} ending in {selectedOrder.paymentInfo.cardLast4}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={getPaymentStatusBadgeVariant(selectedOrder.paymentStatus)}>
                          {selectedOrder.paymentStatus}
                        </Badge>
                        <Select
                          value={selectedOrder.paymentStatus}
                          onValueChange={(value: Order["paymentStatus"]) => {
                            handlePaymentStatusChange(selectedOrder.id, value);
                          }}
                        >
                          <SelectTrigger className="w-36 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order Status */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 border-b border-green-200 dark:border-green-700 pb-2 mb-2">Order Status</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Status</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                        <Select
                          value={selectedOrder.status}
                          onValueChange={(value: Order["status"]) => {
                            handleStatusChange(selectedOrder.id, value);
                          }}
                        >
                          <SelectTrigger className="w-36 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Date</p>
                      <p className="text-gray-900 dark:text-gray-100">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="text-gray-900 dark:text-gray-100">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Notes */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 border-b border-yellow-200 dark:border-yellow-800 pb-2 mb-2">Customer Notes</h3>
                  <p className="italic text-gray-900 dark:text-gray-100">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CardContent>
  );
};

export default OrdersPanel;
