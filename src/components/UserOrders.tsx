import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserOrders } from '@/hooks/useUserOrders';
import { format } from 'date-fns';

const UserOrders = () => {
  const { orders, loading } = useUserOrders();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
      
      {orders.map((order) => (
        <Card key={order.id} className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                <p className="text-sm text-gray-600">
                  Placed on {format(new Date(order.created_at), 'PPP')}
                </p>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
                <p className="text-lg font-semibold mt-1">
                  ${order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {Array.isArray(order.items) && order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-3">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          {item.color && item.color !== '-' && (
                            <p className="text-gray-500">Color: {item.color}</p>
                          )}
                          {item.size && item.size !== '-' && (
                            <p className="text-gray-500">Size: {item.size}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p>Qty: {item.quantity}</p>
                        <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {order.customer_info?.address && (
                <div>
                  <h4 className="font-medium mb-1">Shipping Address:</h4>
                  <p className="text-sm text-gray-600">
                    {order.customer_info.address.street}, {order.customer_info.address.city}, {order.customer_info.address.zipCode}
                  </p>
                </div>
              )}

              {/* Order Notes */}
              {order.notes && (
                <div>
                  <h4 className="font-medium mb-1">Notes:</h4>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserOrders;