
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
        .eq('status', 'active')
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
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        const errorMsg = 'You must be logged in to add products';
        console.error('User authentication error:', userError);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Strict validation - reject if missing required fields
      if (!productData.name?.trim()) {
        const errorMsg = 'Product name is required';
        console.error('Validation error:', errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!productData.price || parseFloat(productData.price) <= 0) {
        const errorMsg = 'Valid product price is required';
        console.error('Validation error:', errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      if (!productData.type) {
        const errorMsg = 'Product type is required';
        console.error('Validation error:', errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Clean and prepare data for insert
      const cleanProductData = {
        user_id: user.id, // Link to authenticated user
        name: productData.name.trim(),
        description: productData.description?.trim() || '',
        price: parseFloat(productData.price),
        type: productData.type,
        category: productData.category || 'Men',
        main_image: productData.main_image || '',
        image_url: productData.main_image || '', // For backward compatibility
        images: Array.isArray(productData.images) ? productData.images.filter(Boolean) : [],
        colors: Array.isArray(productData.colors) ? productData.colors.filter(Boolean) : [],
        sizes: Array.isArray(productData.sizes) ? productData.sizes.filter(size => size?.size) : [],
        discount: parseFloat(productData.discount) || 0,
        featured: Boolean(productData.featured),
        stock: parseInt(productData.stock) || 0,
        inventory: parseInt(productData.inventory) || parseInt(productData.stock) || 0,
        status: 'active'
      };
      
      console.log('Cleaned product data for database insert:', cleanProductData);
      
      // Insert into database
      const { data, error } = await supabase
        .from('products')
        .insert([cleanProductData])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        toast.error('Failed to add product: ' + error.message);
        throw error;
      }
      
      if (!data) {
        const errorMsg = 'No data returned from database insert';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Product successfully added to database:', data);
      toast.success('Product added successfully');
      
      // Immediately refresh products from database to ensure UI matches DB
      await fetchProducts();
      return data;
      
    } catch (error) {
      console.error('Exception in addProduct:', error);
      throw error;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      console.log('Updating product in database:', id, updates);
      
      if (!id) {
        const errorMsg = 'Product ID is required for update';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Get current user to verify ownership
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        const errorMsg = 'You must be logged in to update products';
        console.error('User authentication error:', userError);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Validate required fields for updates
      if (updates.name && !updates.name.trim()) {
        const errorMsg = 'Product name cannot be empty';
        console.error('Validation error:', errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      if (updates.price && parseFloat(updates.price) <= 0) {
        const errorMsg = 'Valid product price is required';
        console.error('Validation error:', errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Clean update data
      const cleanUpdates = {
        ...(updates.name && { name: updates.name.trim() }),
        ...(updates.description !== undefined && { description: updates.description?.trim() || '' }),
        ...(updates.price && { price: parseFloat(updates.price) }),
        ...(updates.type && { type: updates.type }),
        ...(updates.category && { category: updates.category }),
        ...(updates.main_image !== undefined && { 
          main_image: updates.main_image || '',
          image_url: updates.main_image || '' // Keep both for compatibility
        }),
        ...(updates.images && { images: Array.isArray(updates.images) ? updates.images.filter(Boolean) : [] }),
        ...(updates.colors && { colors: Array.isArray(updates.colors) ? updates.colors.filter(Boolean) : [] }),
        ...(updates.sizes && { sizes: Array.isArray(updates.sizes) ? updates.sizes.filter(size => size?.size) : [] }),
        ...(updates.discount !== undefined && { discount: parseFloat(updates.discount) || 0 }),
        ...(updates.featured !== undefined && { featured: Boolean(updates.featured) }),
        ...(updates.stock !== undefined && { stock: parseInt(updates.stock) || 0 }),
        ...(updates.inventory !== undefined && { inventory: parseInt(updates.inventory) || parseInt(updates.stock) || 0 })
      };
      
      console.log('Cleaned update data:', cleanUpdates);
      
      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own products
        .select()
        .single();
      
      if (error) {
        console.error('Supabase update error:', error);
        toast.error('Failed to update product: ' + error.message);
        throw error;
      }
      
      if (!data) {
        const errorMsg = 'No data returned from database update';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Product successfully updated in database:', data);
      toast.success('Product updated successfully');
      
      // Refresh products from database
      await fetchProducts();
      return data;
      
    } catch (error) {
      console.error('Exception in updateProduct:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      console.log('Deleting product from database:', id);
      
      if (!id) {
        const errorMsg = 'Product ID is required for deletion';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Get current user to verify ownership
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        const errorMsg = 'You must be logged in to delete products';
        console.error('User authentication error:', userError);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own products
      
      if (error) {
        console.error('Supabase delete error:', error);
        toast.error('Failed to delete product: ' + error.message);
        throw error;
      }
      
      console.log('Product successfully deleted from database');
      toast.success('Product deleted successfully');
      
      // Refresh products from database
      await fetchProducts();
      return true;
      
    } catch (error) {
      console.error('Exception in deleteProduct:', error);
      throw error;
    }
  };

  return { 
    products, 
    loading, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    refetch: fetchProducts 
  };
};
