
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProductOperations } from './useProductOperations';
import { ProductFormData, ProductUpdateData } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { addProduct: addProductOperation, updateProduct: updateProductOperation, deleteProduct: deleteProductOperation } = useProductOperations();

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
    
    console.log('🎯 Adding product with user context:', { userId: user.id, isAdmin });
    const result = await addProductOperation(productData);
    if (result) {
      await fetchProducts(); // Refetch to ensure UI is updated
      toast.success('Product added successfully and will appear in your catalog');
    }
    return result;
  };

  const updateProduct = async (id: string, updates: ProductUpdateData) => {
    if (!user) {
      toast.error('You must be logged in to update products');
      return null;
    }
    
    const result = await updateProductOperation(id, updates);
    if (result) {
      await fetchProducts(); // Refetch to ensure UI is updated
    }
    return result;
  };

  const deleteProduct = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete products');
      return null;
    }
    
    const result = await deleteProductOperation(id);
    if (result) {
      await fetchProducts(); // Refetch to ensure UI is updated
    }
    return result;
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
