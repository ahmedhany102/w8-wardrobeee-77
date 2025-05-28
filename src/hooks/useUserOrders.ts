
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
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching orders for user:', user.id);

      // Use the secure function we created
      const { data, error } = await supabase
        .rpc('get_user_orders', { user_uuid: user.id });
      
      if (error) {
        console.error('Error fetching user orders:', error);
        toast.error('Failed to load your orders');
        return;
      }
      
      console.log('Fetched user orders:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user?.id]);

  return { orders, loading, refetch: fetchUserOrders };
};
