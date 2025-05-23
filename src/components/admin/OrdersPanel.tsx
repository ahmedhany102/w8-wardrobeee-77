
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow, TableHeader, TableHead, Table, TableBody } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import OrderDatabase from '@/models/OrderDatabase';
import { Order, OrderItem } from '@/models/Order';
import { Badge } from '@/components/ui/badge';

const OrderStatusBadge = ({ status }: { status: string }) => {
  let className = '';
  
  switch(status) {
    case 'PENDING':
      className = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      break;
    case 'PROCESSING':
      className = 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      break;
    case 'SHIPPED':
      className = 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100';
      break;
    case 'DELIVERED':
      className = 'bg-green-100 text-green-800 hover:bg-green-100';
      break;
    case 'CANCELLED':
      className = 'bg-red-100 text-red-800 hover:bg-red-100';
      break;
    case 'PAID':
      className = 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      break;
    case 'FAILED':
      className = 'bg-rose-100 text-rose-800 hover:bg-rose-100';
      break;
    default:
      className = 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
  
  return <Badge className={className}>{status}</Badge>;
};

const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);
  
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [orderStatusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orderDb = OrderDatabase.getInstance();
      let allOrders = await orderDb.getAllOrders();
      
      // Store total count before filtering
      setTotalOrdersCount(allOrders.length);
      
      // Apply status filter if not "ALL"
      if (orderStatusFilter !== "ALL") {
        allOrders = allOrders.filter(order => order.status === orderStatusFilter);
      }
      
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderDb = OrderDatabase.getInstance();
      await orderDb.updateOrderStatus(orderId, newStatus as Order['status']);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      const orderDb = OrderDatabase.getInstance();
      const success = await orderDb.deleteOrder(orderToDelete);
      
      if (success) {
        toast.success('Order deleted successfully');
        setOrders(orders.filter(order => order.id !== orderToDelete));
        setTotalOrdersCount(prev => prev - 1);
      } else {
        toast.error('Failed to delete order');
      }
      
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
      setShowDeleteDialog(false);
    }
  };

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Orders Management</h2>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-sm">
            Total: {totalOrdersCount}
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage customer orders and update their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            <div>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Items</TableHead>
                      <TableHead className="hidden sm:table-cell">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <TableRow key={order.id} onClick={() => handleOrderClick(order)} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {order.customerInfo.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{order.items.length}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.totalAmount.toFixed(2)} EGP</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Select
                              defaultValue={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger className="h-8 w-[110px]">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PROCESSING">Processing</SelectItem>
                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(order.id);
                              }}
                              className="h-8"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Order Information</h3>
                  <p>Order #: {selectedOrder.orderNumber}</p>
                  <p>Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p>Status: <OrderStatusBadge status={selectedOrder.status} /></p>
                  <p>Payment: <OrderStatusBadge status={selectedOrder.paymentStatus} /></p>
                </div>
                <div>
                  <h3 className="font-semibold">Customer Information</h3>
                  <p>Name: {selectedOrder.customerInfo.name}</p>
                  <p>Email: {selectedOrder.customerInfo.email}</p>
                  <p>Phone: {selectedOrder.customerInfo.phone}</p>
                  <p>Address: {selectedOrder.customerInfo.address.street}, {selectedOrder.customerInfo.address.city}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Order Items</h3>
                <div className="rounded-md border overflow-hidden mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item: OrderItem, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item.productName}
                            {item.size && <span className="block text-xs text-gray-500">Size: {item.size}</span>}
                            {item.color && <span className="block text-xs text-gray-500">Color: {item.color}</span>}
                          </TableCell>
                          <TableCell className="text-right">{item.unitPrice?.toFixed(2)} EGP</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{item.totalPrice?.toFixed(2)} EGP</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  {selectedOrder.couponInfo && (
                    <div className="text-sm">
                      <span className="font-semibold">Coupon:</span> {selectedOrder.couponInfo.code} ({selectedOrder.couponInfo.discountPercentage}% off)
                    </div>
                  )}
                </div>
                <div className="text-xl font-bold">
                  Total: {selectedOrder.totalAmount.toFixed(2)} EGP
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold">Notes:</h3>
                  <p className="text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteOrder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPanel;
