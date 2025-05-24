
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }
      await fetchProducts();
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, refetch: fetchProducts };
};

export const useSupabaseUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([userData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding user:', error);
        throw error;
      }
      await fetchUsers();
      return data;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  return { users, loading, addUser, updateUser, deleteUser, refetch: fetchUsers };
};

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
        throw error;
      }
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: any) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding order:', error);
        throw error;
      }
      await fetchOrders();
      return data;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrder = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }
      await fetchOrders();
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      return false;
    }
  };

  return { orders, loading, addOrder, updateOrder, refetch: fetchOrders };
};

export const useSupabaseContactSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contact settings:', error);
        throw error;
      }
      setSettings(data);
    } catch (error) {
      console.error('Error fetching contact settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: any) => {
    try {
      let result;
      if (settings?.id) {
        const { data, error } = await supabase
          .from('contact_settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', settings.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating contact settings:', error);
          throw error;
        }
        result = data;
      } else {
        const { data, error } = await supabase
          .from('contact_settings')
          .insert([{ ...updates }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating contact settings:', error);
          throw error;
        }
        result = data;
      }
      
      setSettings(result);
      return true;
    } catch (error) {
      console.error('Error updating contact settings:', error);
      return false;
    }
  };

  return { settings, loading, updateSettings, refetch: fetchSettings };
};
