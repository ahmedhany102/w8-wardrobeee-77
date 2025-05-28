
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  const fetchUserOrders = async () => {
    if (!user?.id || !session) {
      console.log('No user or session available for fetching orders');
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching orders for user:', user.id, user.email);

      // Direct query with explicit user matching
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`customer_info->>user_id.eq.${user.id},customer_info->>email.eq.${user.email}`)
        .order('created_at', { ascending: false });
      
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
    if (user?.id && session) {
      fetchUserOrders();
    } else {
      setLoading(false);
      setOrders([]);
    }
  }, [user?.id, session]);

  return { orders, loading, refetch: fetchUserOrders };
};
