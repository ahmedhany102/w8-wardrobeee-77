
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useUserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Fetching orders for user:', user.id);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`customer_info->>user_id.eq.${user.id},customer_info->>email.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching orders:', error);
        toast.error('Failed to load orders');
        setOrders([]);
        return;
      }

      console.log('✅ Orders fetched:', data?.length || 0);
      
      // Parse items if they're stored as strings
      const ordersWithParsedItems = (data || []).map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : 
               typeof order.items === 'string' ? JSON.parse(order.items) : []
      }));
      
      setOrders(ordersWithParsedItems);
    } catch (error: any) {
      console.error('💥 Exception fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return { 
    orders, 
    loading, 
    refetch: fetchOrders 
  };
};
