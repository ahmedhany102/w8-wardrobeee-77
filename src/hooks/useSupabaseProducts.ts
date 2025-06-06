
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductFormData, ProductUpdateData } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { validateRequiredFields, validateUpdateFields, cleanProductDataForInsert, cleanProductDataForUpdate } from '@/utils/productUtils';

interface Product {
  id: string;
  name: string;
  price: number;
  user_id?: string;
  [key: string]: any;
}

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [user, isAdmin]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from Supabase...');
      
      let query = supabase.from('products').select('*');
      
      // If not admin, only fetch user's own products for management
      // But for catalog view, fetch all products
      if (!isAdmin && window.location.pathname.includes('admin')) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products: ' + error.message);
        setProducts([]);
        return;
      }
      
      console.log('Successfully fetched products:', data);
      setProducts(data || []);
    } catch (error: any) {
      console.error('Exception while fetching products:', error);
      toast.error('Failed to load products: ' + error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: ProductFormData) => {
    if (!user) {
      toast.error('You must be logged in to add products');
      return null;
    }

    try {
      console.log('🎯 Adding product with user context:', { userId: user.id, isAdmin });
      
      const validationError = validateRequiredFields(productData);
      if (validationError) {
        toast.error(validationError);
        return null;
      }

      const cleanData = cleanProductDataForInsert(productData, user.id);
      
      const { data, error } = await supabase
        .from('products')
        .insert(cleanData)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to add product:', error);
        toast.error('Failed to add product: ' + error.message);
        return null;
      }

      console.log('✅ Product added successfully:', data);
      await fetchProducts(); // Refetch to ensure UI is updated
      toast.success('Product added successfully and will appear in your catalog');
      return data;
    } catch (error: any) {
      console.error('💥 Exception while adding product:', error);
      toast.error('Failed to add product: ' + error.message);
      return null;
    }
  };

  const updateProduct = async (id: string, updates: ProductUpdateData) => {
    if (!user) {
      toast.error('You must be logged in to update products');
      return null;
    }

    try {
      const validationError = validateUpdateFields(updates);
      if (validationError) {
        toast.error(validationError);
        return null;
      }

      const cleanUpdates = cleanProductDataForUpdate(updates);
      
      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own products
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update product:', error);
        toast.error('Failed to update product: ' + error.message);
        return null;
      }

      console.log('✅ Product updated successfully:', data);
      await fetchProducts(); // Refetch to ensure UI is updated
      toast.success('Product updated successfully');
      return data;
    } catch (error: any) {
      console.error('💥 Exception while updating product:', error);
      toast.error('Failed to update product: ' + error.message);
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete products');
      return null;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own products

      if (error) {
        console.error('❌ Failed to delete product:', error);
        toast.error('Failed to delete product: ' + error.message);
        return null;
      }

      console.log('✅ Product deleted successfully');
      await fetchProducts(); // Refetch to ensure UI is updated
      toast.success('Product deleted successfully');
      return true;
    } catch (error: any) {
      console.error('💥 Exception while deleting product:', error);
      toast.error('Failed to delete product: ' + error.message);
      return null;
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
