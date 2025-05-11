
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface PaymentInfo {
  method: 'CASH' | 'CREDIT_CARD' | 'WALLET';
  cardLast4?: string;
  cardBrand?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentInfo?: PaymentInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
