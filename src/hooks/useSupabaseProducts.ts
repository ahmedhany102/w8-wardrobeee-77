
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductFormData, ProductUpdateData } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { validateRequiredFields, validateUpdateFields, cleanProductDataForInsert } from '@/utils/productUtils';

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
        const userId = user?.id || '';
        query = query.eq('user_id', userId);
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

      const userId = user.id;
      const cleanData = cleanProductDataForInsert(productData, userId);
      
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

      // Create a simple update object with explicit typing
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name.trim();
      if (updates.description !== undefined) updateData.description = updates.description?.trim() || '';
      if (updates.price) updateData.price = parseFloat(String(updates.price));
      if (updates.type) updateData.type = updates.type;
      if (updates.category) updateData.category = updates.category;
      if (updates.main_image !== undefined) {
        updateData.main_image = updates.main_image || '';
        updateData.image_url = updates.main_image || '';
      }
      if (updates.images) updateData.images = Array.isArray(updates.images) ? updates.images.filter(Boolean) : [];
      if (updates.colors) updateData.colors = Array.isArray(updates.colors) ? updates.colors.filter(Boolean) : [];
      if (updates.sizes) updateData.sizes = Array.isArray(updates.sizes) ? updates.sizes.filter(size => size?.size) : [];
      if (updates.discount !== undefined) updateData.discount = parseFloat(String(updates.discount)) || 0;
      if (updates.featured !== undefined) updateData.featured = Boolean(updates.featured);
      if (updates.stock !== undefined) updateData.stock = parseInt(String(updates.stock)) || 0;
      if (updates.inventory !== undefined) updateData.inventory = parseInt(String(updates.inventory)) || parseInt(String(updates.stock || 0)) || 0;

      const userId = user.id;
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
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
      const userId = user.id;
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure user can only delete their own products

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
