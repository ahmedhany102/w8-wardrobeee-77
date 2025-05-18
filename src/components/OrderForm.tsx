import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Order, OrderItem } from '@/models/Order';
import OrderDatabase from '@/models/OrderDatabase';
import { useAuth } from '@/contexts/AuthContext';

interface OrderFormProps {
  cartItems: {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    color?: string; // أضف color
    size?: string;  // أضف size
  }[];
  total: number;
  onOrderComplete?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ cartItems, total, onOrderComplete }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    zipCode: '',
    notes: '',
    paymentMethod: 'CASH', // Default to Cash on Delivery
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.zipCode) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Convert cart items to order items (مع تمرير اللون والمقاس)
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        imageUrl: item.imageUrl,
        color: item.color || '-', // مرر اللون أو علامة "-"
        size: item.size || '-',   // مرر المقاس أو علامة "-"
      }));

      // Create order object
      const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            zipCode: formData.zipCode,
          }
        },
        items: orderItems,
        totalAmount: total,
        status: 'PENDING',
        paymentStatus: formData.paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
        paymentInfo: {
          method: formData.paymentMethod as Order['paymentInfo']['method'],
        },
        notes: formData.notes
      };

      // Save order to database
      const orderDb = OrderDatabase.getInstance();
      const newOrder = await orderDb.saveOrder(orderData);

      // Show success message
      toast.success('Order placed successfully!');
      console.log('Order created:', newOrder);

      // Clear cart if order placement was successful
      if (onOrderComplete) {
        onOrderComplete();
      }

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Your phone number"
          required
        />
      </div>

      <div>
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="Street name and number"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
        </div>
        <div>
          <Label htmlFor="zipCode">Zip Code</Label>
          <Input
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="Zip Code"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800"
          required
        >
          <option value="CASH">Cash on Delivery</option>
          <option value="CREDIT_CARD">Credit Card</option>
          <option value="WALLET">Mobile Wallet</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
        </select>
      </div>

      <div>
        <Label htmlFor="notes">Order Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any special instructions for delivery?"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-800 hover:bg-green-900"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Complete Order'}
      </Button>
    </form>
  );
};

export default OrderForm;
