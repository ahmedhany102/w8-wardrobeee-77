
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSupabaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
        return;
      }
      
      console.log('Fetched orders:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData) => {
    try {
      console.log('Adding order:', orderData);
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding order:', error);
        toast.error('Failed to create order: ' + error.message);
        throw error;
      }
      
      console.log('Order created successfully:', data);
      toast.success('Order created successfully!');
      await fetchOrders();
      return data;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrder = async (id, updates) => {
    try {
      console.log('Updating order:', id, updates);
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating order:', error);
        toast.error('Failed to update order: ' + error.message);
        throw error;
      }
      
      console.log('Order updated successfully:', data);
      toast.success('Order updated successfully');
      await fetchOrders();
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  return { orders, loading, addOrder, updateOrder, refetch: fetchOrders };
};
