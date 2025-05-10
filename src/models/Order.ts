
// Order model representing customer purchases
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  shippingMethod: string;
  shippingCost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Order email notification service
export const sendOrderNotification = async (order: Order): Promise<boolean> => {
  // In a real application, this would call an API to send an email
  // For now, we'll just log the notification details
  console.log(`Order notification would be sent for order ${order.orderNumber}`);
  console.log(`Customer: ${order.customerInfo.name} (${order.customerInfo.email})`);
  console.log(`Total amount: $${order.totalAmount.toFixed(2)}`);
  console.log(`Items: ${order.items.length}`);
  
  // Mock successful email sending
  return true;
};

// Save order to database
export const saveOrder = async (order: Order): Promise<Order> => {
  // In a real application, this would call an API to save the order to a database
  // For now, we'll just return the order with an ID
  
  // Mock successful order saving
  return {
    ...order,
    id: `order-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Fetch all orders (for admin)
export const fetchAllOrders = async (): Promise<Order[]> => {
  // In a real application, this would call an API to fetch orders from a database
  // For now, we'll just return mock orders
  
  const mockOrders: Order[] = [
    {
      id: 'order-1',
      orderNumber: 'ORD-2025-001',
      customerId: 'cust-1',
      customerInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        }
      },
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          productName: 'Smartphone',
          price: 699.99,
          quantity: 1,
          total: 699.99
        }
      ],
      totalAmount: 699.99,
      status: 'delivered',
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      shippingMethod: 'Express',
      shippingCost: 15.00,
      createdAt: '2025-05-01T10:30:00Z',
      updatedAt: '2025-05-01T10:30:00Z'
    },
    {
      id: 'order-2',
      orderNumber: 'ORD-2025-002',
      customerId: 'cust-2',
      customerInfo: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+9876543210',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          country: 'USA'
        }
      },
      items: [
        {
          id: 'item-2',
          productId: 'prod-2',
          productName: 'Laptop',
          price: 1299.99,
          quantity: 1,
          total: 1299.99
        },
        {
          id: 'item-3',
          productId: 'prod-3',
          productName: 'Headphones',
          price: 99.99,
          quantity: 2,
          total: 199.98
        }
      ],
      totalAmount: 1499.97,
      status: 'processing',
      paymentMethod: 'PayPal',
      paymentStatus: 'paid',
      shippingMethod: 'Standard',
      shippingCost: 8.50,
      createdAt: '2025-05-05T14:20:00Z',
      updatedAt: '2025-05-05T14:20:00Z'
    }
  ];
  
  return mockOrders;
};
