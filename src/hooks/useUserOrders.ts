
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserOrders = async () => {
    if (!user?.id) {
      console.log('No user ID available for fetching orders');
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching orders for user:', user.id, user.email);

      // First try the RPC function, then fallback to direct query
      let data, error;
      
      try {
        const result = await supabase.rpc('get_user_orders', { user_uuid: user.id });
        data = result.data;
        error = result.error;
      } catch (rpcError) {
        console.log('RPC function failed, using direct query:', rpcError);
        
        // Fallback to direct query
        const result = await supabase
          .from('orders')
          .select('*')
          .or(`customer_info->>user_id.eq.${user.id},customer_info->>email.eq.${user.email}`)
          .order('created_at', { ascending: false });
          
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error('Error fetching user orders:', error);
        toast.error('Failed to load your orders');
        setOrders([]);
        return;
      }
      
      console.log('Fetched user orders:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast.error('Failed to load your orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user?.id]);

  return { orders, loading, refetch: fetchUserOrders };
};
