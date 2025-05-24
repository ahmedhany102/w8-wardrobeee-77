
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        toast.error('Failed to load products');
        return;
      }
      
      console.log('Fetched products:', data);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: any) => {
    try {
      console.log('Adding product:', productData);
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding product:', error);
        toast.error('Failed to add product: ' + error.message);
        throw error;
      }
      
      console.log('Product added successfully:', data);
      toast.success('Product added successfully');
      await fetchProducts();
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      console.log('Updating product:', id, updates);
      const { data, error } = await supabase
        .from('products')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating product:', error);
        toast.error('Failed to update product: ' + error.message);
        throw error;
      }
      
      console.log('Product updated successfully:', data);
      toast.success('Product updated successfully');
      await fetchProducts();
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('Deleting product:', id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product: ' + error.message);
        throw error;
      }
      
      console.log('Product deleted successfully');
      toast.success('Product deleted successfully');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
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
        toast.error('Failed to load users');
        return;
      }
      
      console.log('Fetched users:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: any) => {
    try {
      console.log('Adding user:', userData);
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          ...userData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding user:', error);
        toast.error('Failed to add user: ' + error.message);
        throw error;
      }
      
      console.log('User added successfully:', data);
      toast.success('User added successfully');
      await fetchUsers();
      return data;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: any) => {
    try {
      console.log('Updating user:', id, updates);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user:', error);
        toast.error('Failed to update user: ' + error.message);
        throw error;
      }
      
      console.log('User updated successfully:', data);
      toast.success('User updated successfully');
      await fetchUsers();
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      console.log('Deleting user:', id);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user: ' + error.message);
        throw error;
      }
      
      console.log('User deleted successfully');
      toast.success('User deleted successfully');
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
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

  const addOrder = async (orderData: any) => {
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

  const updateOrder = async (id: string, updates: any) => {
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
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contact settings:', error);
        toast.error('Failed to load contact settings');
        return;
      }
      
      const settingsData = data && data.length > 0 ? data[0] : null;
      console.log('Fetched contact settings:', settingsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching contact settings:', error);
      toast.error('Failed to load contact settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: any) => {
    try {
      console.log('Updating contact settings:', updates);
      let result;
      
      if (settings?.id) {
        const { data, error } = await supabase
          .from('contact_settings')
          .update({ 
            ...updates, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', settings.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating contact settings:', error);
          toast.error('Failed to update settings: ' + error.message);
          throw error;
        }
        result = data;
      } else {
        const { data, error } = await supabase
          .from('contact_settings')
          .insert([{ 
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating contact settings:', error);
          toast.error('Failed to create settings: ' + error.message);
          throw error;
        }
        result = data;
      }
      
      console.log('Contact settings updated successfully:', result);
      setSettings(result);
      toast.success('Settings updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating contact settings:', error);
      throw error;
    }
  };

  return { settings, loading, updateSettings, refetch: fetchSettings };
};
