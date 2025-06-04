
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProductOperations } from './useProductOperations';
import { ProductFormData, ProductUpdateData } from '@/types/product';

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addProduct: addProductOperation, updateProduct: updateProductOperation, deleteProduct: deleteProductOperation } = useProductOperations();

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
    } catch (error: any) {
      console.error('Exception while fetching products:', error);
      toast.error('Failed to load products: ' + error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: ProductFormData) => {
    const result = await addProductOperation(productData);
    await fetchProducts();
    return result;
  };

  const updateProduct = async (id: string, updates: ProductUpdateData) => {
    const result = await updateProductOperation(id, updates);
    await fetchProducts();
    return result;
  };

  const deleteProduct = async (id: string) => {
    const result = await deleteProductOperation(id);
    await fetchProducts();
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
