
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
      console.log('Fetching orders for user ID:', user.id);
      console.log('User email:', user.email);

      // Try multiple approaches to find user orders
      const { data: directOrders, error: directError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_info->>user_id', user.id)
        .order('created_at', { ascending: false });

      if (directError) {
        console.error('Direct query error:', directError);
      }

      const { data: emailOrders, error: emailError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_info->>email', user.email)
        .order('created_at', { ascending: false });

      if (emailError) {
        console.error('Email query error:', emailError);
      }

      // Combine results and remove duplicates
      const allOrders = [...(directOrders || []), ...(emailOrders || [])];
      const uniqueOrders = allOrders.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      );

      console.log('Found orders:', uniqueOrders);
      setOrders(uniqueOrders);
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
      console.log('User changed, fetching orders for:', user.id);
      fetchUserOrders();
    } else {
      console.log('No user, clearing orders');
      setLoading(false);
      setOrders([]);
    }
  }, [user?.id, user?.email, session]);

  return { orders, loading, refetch: fetchUserOrders };
};
