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
      console.log('Fetching products from Supabase...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products: ' + error.message);
        setProducts([]);
        return;
      }
      
      console.log('Successfully fetched products:', data);
      setProducts(data || []);
    } catch (error) {
      console.error('Exception while fetching products:', error);
      toast.error('Failed to load products: ' + error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    try {
      console.log('Adding product to Supabase:', productData);
      
      // Validate required fields
      if (!productData.name || !productData.price) {
        const errorMsg = 'Name and price are required';
        console.error('Validation error:', errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        toast.error('Failed to add product: ' + error.message);
        throw error;
      }
      
      if (!data) {
        const errorMsg = 'No data returned from insert';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Product added successfully to database:', data);
      toast.success('Product added successfully');
      
      // Refresh the products list immediately
      await fetchProducts();
      return data;
    } catch (error) {
      console.error('Exception in addProduct:', error);
      throw error;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      console.log('Updating product in Supabase:', id, updates);
      
      if (!id) {
        const errorMsg = 'Product ID is required for update';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

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
        console.error('Supabase update error:', error);
        toast.error('Failed to update product: ' + error.message);
        throw error;
      }
      
      if (!data) {
        const errorMsg = 'No data returned from update';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Product updated successfully in database:', data);
      toast.success('Product updated successfully');
      
      // Refresh the products list
      await fetchProducts();
      return data;
    } catch (error) {
      console.error('Exception in updateProduct:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      console.log('Deleting product from Supabase:', id);
      
      if (!id) {
        const errorMsg = 'Product ID is required for deletion';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase delete error:', error);
        toast.error('Failed to delete product: ' + error.message);
        throw error;
      }
      
      console.log('Product deleted successfully from database');
      toast.success('Product deleted successfully');
      
      // Refresh the products list
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Exception in deleteProduct:', error);
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

  const addUser = async (userData) => {
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

  const updateUser = async (id, updates) => {
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

  const deleteUser = async (id) => {
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

  const updateSettings = async (updates) => {
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
