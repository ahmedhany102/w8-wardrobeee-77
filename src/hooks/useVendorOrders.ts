import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface VendorOrder {
  order_id: string;
  order_number: string;
  order_status: string;
  order_date: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  item_count: number;
  vendor_total: number;
}

export interface VendorOrderItem {
  item_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  size: string | null;
  color: string | null;
  item_status: string;
  vendor_id: string;
}

export const useVendorOrders = (statusFilter?: string) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      console.log('🔴 useVendorOrders: No user, skipping fetch');
      setLoading(false);
      return;
    }

    console.log('🟢 useVendorOrders: Fetching orders for user:', {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      statusFilter: statusFilter || 'all'
    });

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_vendor_orders', {
        _vendor_id: null,
        _status_filter: statusFilter || 'all'
      });

      if (error) {
        console.error('🔴 useVendorOrders: Error fetching vendor orders:', error);
        toast.error('فشل في تحميل الطلبات');
        return;
      }

      console.log('🟢 useVendorOrders: RPC returned data:', {
        rowCount: data?.length || 0,
        orders: data
      });

      setOrders(data || []);
    } catch (error) {
      console.error('🔴 useVendorOrders: Exception in fetchOrders:', error);
      toast.error('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    console.log('🔵 useVendorOrders: useEffect triggered, user=', user?.email);
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    refetch: fetchOrders
  };
};

export const useVendorOrderDetails = (orderId: string) => {
  const { user } = useAuth();
  const [items, setItems] = useState<VendorOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user || !orderId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_vendor_order_items', {
        _order_id: orderId,
        _vendor_id: null
      });

      if (error) {
        console.error('Error fetching order items:', error);
        toast.error('فشل في تحميل تفاصيل الطلب');
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Error in fetchItems:', error);
      toast.error('حدث خطأ أثناء تحميل تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  }, [user, orderId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateItemStatus = async (itemId: string, newStatus: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('update_order_item_status', {
        _item_id: itemId,
        _new_status: newStatus
      });

      if (error) {
        console.error('Error updating item status:', error);
        toast.error('فشل في تحديث حالة المنتج');
        return false;
      }

      toast.success('تم تحديث حالة المنتج بنجاح');
      await fetchItems();
      return true;
    } catch (error) {
      console.error('Error in updateItemStatus:', error);
      toast.error('حدث خطأ أثناء تحديث الحالة');
      return false;
    }
  };

  return {
    items,
    loading,
    updateItemStatus,
    refetch: fetchItems
  };
};

// Admin hook for managing all orders
export const useAdminOrders = (vendorFilter?: string, statusFilter?: string) => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_vendor_orders', {
        _vendor_id: vendorFilter || null,
        _status_filter: statusFilter || 'all'
      });

      if (error) {
        console.error('Error fetching admin orders:', error);
        toast.error('فشل في تحميل الطلبات');
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast.error('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, vendorFilter, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('ليس لديك صلاحية لتغيير حالة الطلب');
      return false;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast.error('فشل في تحديث حالة الطلب');
        return false;
      }

      toast.success('تم تحديث حالة الطلب بنجاح');
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      toast.error('حدث خطأ أثناء تحديث الحالة');
      return false;
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    refetch: fetchOrders
  };
};

export const useAdminOrderDetails = (orderId: string) => {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<VendorOrderItem[]>([]);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!user || !isAdmin || !orderId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch order info
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        toast.error('فشل في تحميل بيانات الطلب');
        return;
      }

      setOrderInfo(orderData);

      // Fetch all items (admin sees all)
      const { data: itemsData, error: itemsError } = await supabase.rpc('get_vendor_order_items', {
        _order_id: orderId,
        _vendor_id: null
      });

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        toast.error('فشل في تحميل تفاصيل الطلب');
        return;
      }

      setItems(itemsData || []);
    } catch (error) {
      console.error('Error in fetchDetails:', error);
      toast.error('حدث خطأ أثناء تحميل التفاصيل');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, orderId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    items,
    orderInfo,
    loading,
    refetch: fetchDetails
  };
};
