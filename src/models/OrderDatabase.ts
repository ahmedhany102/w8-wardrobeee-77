
import { Order, OrderItem, CustomerInfo } from './Order';

// Mock database for orders
class OrderDatabase {
  private static instance: OrderDatabase;
  private orders: Order[];

  private constructor() {
    // Initialize with mock data or load from localStorage
    const savedOrders = localStorage.getItem('orders');
    this.orders = savedOrders ? JSON.parse(savedOrders) : [];
  }

  public static getInstance(): OrderDatabase {
    if (!OrderDatabase.instance) {
      OrderDatabase.instance = new OrderDatabase();
    }
    return OrderDatabase.instance;
  }

  // Save order to database
  public async saveOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.push(newOrder);
    this.persistToStorage();
    
    // Send notification email (mock)
    this.sendOrderNotification(newOrder);
    
    return newOrder;
  }

  // Get all orders (for admin)
  public async getAllOrders(): Promise<Order[]> {
    return this.orders;
  }

  // Get orders by customer ID
  public async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    return this.orders.filter(order => order.customerId === customerId);
  }

  // Get order by ID
  public async getOrderById(orderId: string): Promise<Order | undefined> {
    return this.orders.find(order => order.id === orderId);
  }

  // Update order status
  public async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return null;
    }
    
    this.orders[orderIndex].status = status;
    this.orders[orderIndex].updatedAt = new Date().toISOString();
    this.persistToStorage();
    
    return this.orders[orderIndex];
  }

  // Update payment status
  public async updatePaymentStatus(orderId: string, status: Order['paymentStatus']): Promise<Order | null> {
    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      return null;
    }
    
    this.orders[orderIndex].paymentStatus = status;
    this.orders[orderIndex].updatedAt = new Date().toISOString();
    this.persistToStorage();
    
    return this.orders[orderIndex];
  }

  // Persist to localStorage
  private persistToStorage(): void {
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }

  // Send email notification
  private sendOrderNotification(order: Order): void {
    console.log(`New order received: ${order.orderNumber}`);
    console.log(`Customer: ${order.customerInfo.name} (${order.customerInfo.email})`);
    console.log(`Total amount: $${order.totalAmount.toFixed(2)}`);
    console.log(`Items: ${order.items.length}`);
    
    // In a real application, this would send an actual email to the admin
    console.log("Email notification would be sent to admin");
  }
}

export default OrderDatabase;
