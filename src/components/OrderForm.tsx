
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { CustomerInfo, OrderItem, PaymentInfo } from '@/models/Order';
import OrderDatabase from '@/models/OrderDatabase';
import { useAuth } from '@/contexts/AuthContext';

const orderFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(8, { message: 'Please enter a valid phone number' }),
  street: z.string().min(3, { message: 'Street address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  zipCode: z.string().min(5, { message: 'Zip code is required' }),
  paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'WALLET'], {
    required_error: 'Please select a payment method',
  }),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  items: OrderItem[];
  totalAmount: number;
  onOrderComplete: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ items, totalAmount, onOrderComplete }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      street: '',
      city: '',
      zipCode: '',
      paymentMethod: 'CASH',
      notes: '',
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    if (!user) {
      toast.error("Please log in to complete your order");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create customer info from form data
      const customerInfo: CustomerInfo = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          zipCode: data.zipCode,
          country: 'Egypt' // Default for this example
        }
      };

      // Create payment info
      const paymentInfo: PaymentInfo = {
        method: data.paymentMethod
      };
      
      // If credit card selected, mock the last 4 digits
      if (data.paymentMethod === 'CREDIT_CARD') {
        paymentInfo.cardLast4 = '4242';
        paymentInfo.cardBrand = 'Visa';
      }

      // Save order to mock database
      const orderDb = OrderDatabase.getInstance();
      const order = await orderDb.saveOrder({
        customerId: user.id,
        customerInfo,
        items,
        totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentInfo,
        notes: data.notes,
        orderNumber: '' // Will be generated in the OrderDatabase
      });

      toast.success("Order placed successfully!");
      console.log("Order created:", order);
      onOrderComplete();
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to process your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-md border-green-700 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-green-800 to-black text-white">
        <CardTitle>Complete Your Order</CardTitle>
        <CardDescription className="text-gray-200">
          Please provide your delivery and payment information
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 max-h-[70vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your full name" 
                          {...field} 
                          className="hover:border-green-600 focus:border-green-700" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          type="email" 
                          {...field} 
                          className="hover:border-green-600 focus:border-green-700" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+20 123 456 7890" 
                          {...field} 
                          className="hover:border-green-600 focus:border-green-700" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800">Shipping Address</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main St, Apt 4B" 
                          {...field} 
                          className="hover:border-green-600 focus:border-green-700" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Cairo" 
                            {...field} 
                            className="hover:border-green-600 focus:border-green-700" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="12345" 
                            {...field} 
                            className="hover:border-green-600 focus:border-green-700" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800">Payment Method</h3>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="CASH" />
                          </FormControl>
                          <FormLabel className="font-normal">Cash on Delivery</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="CREDIT_CARD" />
                          </FormControl>
                          <FormLabel className="font-normal">Credit Card</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="WALLET" />
                          </FormControl>
                          <FormLabel className="font-normal">Digital Wallet</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800">Additional Notes</h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special instructions for delivery..." 
                        {...field} 
                        className="hover:border-green-600 focus:border-green-700 resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal:</span>
                <span className="font-semibold">{totalAmount.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Shipping:</span>
                <span className="font-semibold">25.00 EGP</span>
              </div>
              <div className="border-t border-green-200 my-2"></div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{(totalAmount + 25).toFixed(2)} EGP</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-green-800 hover:bg-green-900 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="bg-green-50 border-t border-green-100 flex justify-center">
        <p className="text-xs text-gray-500">
          By placing your order, you agree to our terms and conditions.
        </p>
      </CardFooter>
    </Card>
  );
};

export default OrderForm;
