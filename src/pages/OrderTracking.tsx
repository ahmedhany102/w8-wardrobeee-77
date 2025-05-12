
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/models/Order";
import OrderDatabase from "@/models/OrderDatabase";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Truck, Package, ShoppingBag, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const OrderTracking = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const orderDb = OrderDatabase.getInstance();
      const userOrders = await orderDb.getOrdersByCustomerId(user?.id || "");
      setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "PROCESSING":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "SHIPPED":
        return "bg-green-500 text-white hover:bg-green-600";
      case "DELIVERED":
        return "bg-green-700 text-white hover:bg-green-800";
      case "CANCELLED":
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-gray-400 hover:bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "PAID":
        return "bg-green-500 text-white hover:bg-green-600";
      case "PENDING":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "FAILED":
        return "bg-red-500 text-white hover:bg-red-600";
      case "REFUNDED":
        return "bg-blue-500 text-white hover:bg-blue-600";
      default:
        return "bg-gray-400 hover:bg-gray-500";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Loader2 className="h-4 w-4 mr-1 animate-spin" />;
      case "PROCESSING":
        return <Package className="h-4 w-4 mr-1" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4 mr-1" />;
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return <ShoppingBag className="h-4 w-4 mr-1" />;
    }
  };

  const canCancel = (order: Order) => {
    return order.status === "PENDING" || order.status === "PROCESSING";
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      const orderDb = OrderDatabase.getInstance();
      const updatedOrder = await orderDb.updateOrderStatus(selectedOrder.id, "CANCELLED");
      if (updatedOrder) {
        toast.success(`Order #${selectedOrder.orderNumber} has been cancelled`);
        // Refresh orders list
        fetchOrders();
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("An error occurred while cancelling the order");
    } finally {
      setShowCancelDialog(false);
      setSelectedOrder(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["PENDING", "PROCESSING", "SHIPPED"].includes(order.status);
    if (activeTab === "completed") return order.status === "DELIVERED";
    if (activeTab === "cancelled") return order.status === "CANCELLED";
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800 mb-4"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">You need to login to view your orders</h2>
          <Button onClick={() => window.location.href = "/login"}>Login</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-green-800">Order Tracking & History</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 bg-gradient-to-r from-green-900 to-black flex justify-between space-x-4 px-4 w-full">
            <TabsTrigger value="all" className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800">
              All Orders
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800">
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800">
              Cancelled
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-xl text-gray-500 mb-4">No {activeTab !== 'all' ? activeTab : ''} orders found</p>
                  <Button 
                    onClick={() => window.location.href = "/"} 
                    className="bg-green-800 hover:bg-green-900"
                  >
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden border-green-100 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                        <div className="space-y-1">
                          <CardTitle className="text-lg md:text-xl">Order #{order.orderNumber}</CardTitle>
                          <CardDescription className="text-gray-200">
                            Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center">
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </Badge>
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                          {canCancel(order) && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowCancelDialog(true);
                              }}
                              className="h-7 bg-red-600 hover:bg-red-700"
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Shipping Information */}
                          <div>
                            <h3 className="font-medium text-green-800 mb-2">Shipping Details</h3>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Name:</span> {order.customerInfo.name}</p>
                              <p><span className="font-medium">Address:</span> {order.customerInfo.address.street}, {order.customerInfo.address.city}, {order.customerInfo.address.state}</p>
                              <p><span className="font-medium">Country:</span> {order.customerInfo.address.country}</p>
                              <p><span className="font-medium">Phone:</span> {order.customerInfo.phone}</p>
                            </div>
                          </div>
                          
                          {/* Payment Information */}
                          <div>
                            <h3 className="font-medium text-green-800 mb-2">Payment Information</h3>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Method:</span> {order.paymentInfo?.method}</p>
                              {order.paymentInfo?.cardLast4 && (
                                <p><span className="font-medium">Card:</span> **** **** **** {order.paymentInfo.cardLast4}</p>
                              )}
                              <p><span className="font-medium">Total:</span> {order.totalAmount.toFixed(2)} EGP</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Order Items */}
                        <div>
                          <h3 className="font-medium text-green-800 mb-2">Order Items</h3>
                          <div className="overflow-x-auto">
                            <Table className="w-full">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead className="text-right">Quantity</TableHead>
                                  <TableHead className="text-right">Unit Price</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.items.map((item, index) => (
                                  <TableRow key={index} className="hover:bg-green-50">
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{item.unitPrice.toFixed(2)} EGP</TableCell>
                                    <TableCell className="text-right">{item.totalPrice.toFixed(2)} EGP</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                        
                        {/* Order Timeline */}
                        {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) && (
                          <div className="mt-6">
                            <h3 className="font-medium text-green-800 mb-2">Order Progress</h3>
                            <div className="flex items-center w-full">
                              <div className="flex-1 text-center">
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto ${
                                      ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) 
                                        ? "bg-green-600 text-white" 
                                        : "bg-gray-300"
                                    }`}>
                                      1
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="text-sm p-2">Order Confirmed</HoverCardContent>
                                </HoverCard>
                                <p className="text-xs mt-2">Confirmed</p>
                              </div>
                              
                              <div className="h-1 flex-1 bg-gray-300">
                                <div className={`h-full ${
                                  ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) 
                                    ? "bg-green-600" 
                                    : "bg-gray-300"
                                }`}></div>
                              </div>
                              
                              <div className="flex-1 text-center">
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto ${
                                      ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status) 
                                        ? "bg-green-600 text-white" 
                                        : "bg-gray-300"
                                    }`}>
                                      2
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="text-sm p-2">Order Processing</HoverCardContent>
                                </HoverCard>
                                <p className="text-xs mt-2">Processing</p>
                              </div>
                              
                              <div className="h-1 flex-1 bg-gray-300">
                                <div className={`h-full ${
                                  ["SHIPPED", "DELIVERED"].includes(order.status) 
                                    ? "bg-green-600" 
                                    : "bg-gray-300"
                                }`}></div>
                              </div>
                              
                              <div className="flex-1 text-center">
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto ${
                                      ["SHIPPED", "DELIVERED"].includes(order.status) 
                                        ? "bg-green-600 text-white" 
                                        : "bg-gray-300"
                                    }`}>
                                      3
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="text-sm p-2">Order Shipped</HoverCardContent>
                                </HoverCard>
                                <p className="text-xs mt-2">Shipped</p>
                              </div>
                              
                              <div className="h-1 flex-1 bg-gray-300">
                                <div className={`h-full ${
                                  order.status === "DELIVERED" 
                                    ? "bg-green-600" 
                                    : "bg-gray-300"
                                }`}></div>
                              </div>
                              
                              <div className="flex-1 text-center">
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto ${
                                      order.status === "DELIVERED" 
                                        ? "bg-green-600 text-white" 
                                        : "bg-gray-300"
                                    }`}>
                                      4
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="text-sm p-2">Order Delivered</HoverCardContent>
                                </HoverCard>
                                <p className="text-xs mt-2">Delivered</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Cancelled Status */}
                        {order.status === "CANCELLED" && (
                          <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                              <span className="text-red-700 font-medium">This order has been cancelled</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">No, keep order</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleCancelOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default OrderTracking;
