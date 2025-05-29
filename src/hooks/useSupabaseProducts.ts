
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
