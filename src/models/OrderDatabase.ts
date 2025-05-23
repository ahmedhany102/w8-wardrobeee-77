
import { Order, OrderItem } from './Order';
import { supabase } from '@/integrations/supabase/client';

class OrderDatabase {
  private static instance: OrderDatabase;

  private constructor() {}

  public static getInstance(): OrderDatabase {
    if (!OrderDatabase.instance) {
      OrderDatabase.instance = new OrderDatabase();
    }
    return OrderDatabase.instance;
  }

  // Save order to database
  public async saveOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      const orderData = {
        order_number: order.orderNumber,
        customer_info: order.customerInfo,
        items: order.items,
        total_amount: order.totalAmount,
        status: order.status,
        payment_status: order.paymentStatus,
        payment_info: order.paymentInfo,
        coupon_info: order.couponInfo,
        notes: order.notes
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('Error saving order to Supabase:', error);
        // Fallback to local creation if auth error
        const newOrder: Order = {
          ...order,
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return newOrder;
      }

      return this.mapDatabaseOrderToModel(data);
    } catch (error) {
      console.error('Error in saveOrder:', error);
      // Fallback to local creation
      const newOrder: Order = {
        ...order,
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Send notification email (mock)
      this.sendOrderNotification(newOrder);
      
      return newOrder;
    }
  }

  // Create order (alias for saveOrder for compatibility)
  public async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newOrder = await this.saveOrder(order);
    return newOrder.id;
  }

  // Cancel order by ID
  public async cancelOrder(orderId: string): Promise<Order | null> {
    return this.updateOrderStatus(orderId, "CANCELLED");
  }

  // Get all orders (for admin)
  public async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all orders:', error);
        return [];
      }

      return data.map(this.mapDatabaseOrderToModel);
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      return [];
    }
  }

  // Get orders by customer email
  public async getOrdersByCustomerEmail(email: string): Promise<Order[]> {
    try {
      // Use Postgres JSON operator to search inside customer_info
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .filter('customer_info->email', 'eq', email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders by email:', error);
        return [];
      }

      return data.map(this.mapDatabaseOrderToModel);
    } catch (error) {
      console.error('Error in getOrdersByCustomerEmail:', error);
      return [];
    }
  }

  // Get order by ID
  public async getOrderById(orderId: string): Promise<Order | undefined> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching order by ID:', error);
        return undefined;
      }

      return this.mapDatabaseOrderToModel(data);
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return undefined;
    }
  }

  // Get order by order number
  public async getOrderByOrderNumber(orderNumber: string): Promise<Order | undefined> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching order by order number:', error);
        return undefined;
      }

      return this.mapDatabaseOrderToModel(data);
    } catch (error) {
      console.error('Error in getOrderByOrderNumber:', error);
      return undefined;
    }
  }

  // Update order status
  public async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error || !data) {
        console.error('Error updating order status:', error);
        return null;
      }
      
      return this.mapDatabaseOrderToModel(data);
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return null;
    }
  }

  // Update payment status
  public async updatePaymentStatus(orderId: string, status: Order['paymentStatus']): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          payment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error || !data) {
        console.error('Error updating payment status:', error);
        return null;
      }
      
      return this.mapDatabaseOrderToModel(data);
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      return null;
    }
  }

  // Get recent orders - for admin dashboard
  public async getRecentOrders(limit: number = 5): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent orders:', error);
        return [];
      }

      return data.map(this.mapDatabaseOrderToModel);
    } catch (error) {
      console.error('Error in getRecentOrders:', error);
      return [];
    }
  }

  // Count orders by status - for admin dashboard
  public async countOrdersByStatus(): Promise<Record<Order['status'], number>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status');

      if (error) {
        console.error('Error counting orders by status:', error);
        return {
          PENDING: 0,
          PROCESSING: 0,
          SHIPPED: 0,
          DELIVERED: 0,
          CANCELLED: 0,
        };
      }

      const counts: Record<Order['status'], number> = {
        PENDING: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      };
      
      data.forEach(order => {
        const status = order.status as Order['status'];
        counts[status] = (counts[status] || 0) + 1;
      });
      
      return counts;
    } catch (error) {
      console.error('Error in countOrdersByStatus:', error);
      return {
        PENDING: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      };
    }
  }

  // Get total revenue - for admin dashboard
  public async getTotalRevenue(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, status');

      if (error) {
        console.error('Error calculating total revenue:', error);
        return 0;
      }

      return data
        .filter(order => order.status !== 'CANCELLED')
        .reduce((total, order) => total + order.total_amount, 0);
    } catch (error) {
      console.error('Error in getTotalRevenue:', error);
      return 0;
    }
  }

  // Delete an order - new admin function
  public async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) {
        console.error('Error deleting order:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      return false;
    }
  }

  // Send email notification
  private sendOrderNotification(order: Order): void {
    // In a real application, this would send an actual email to the admin
    console.log('Sending notification for order:', order.orderNumber);
  }

  // Helper method to convert database fields (snake_case) to model fields (camelCase)
  private mapDatabaseOrderToModel(dbOrder: any): Order {
    return {
      id: dbOrder.id,
      orderNumber: dbOrder.order_number,
      customerInfo: dbOrder.customer_info,
      items: dbOrder.items,
      totalAmount: dbOrder.total_amount,
      status: dbOrder.status,
      paymentStatus: dbOrder.payment_status,
      paymentInfo: dbOrder.payment_info,
      couponInfo: dbOrder.coupon_info,
      notes: dbOrder.notes,
      createdAt: dbOrder.created_at,
      updatedAt: dbOrder.updated_at
    };
  }
}

export default OrderDatabase;
