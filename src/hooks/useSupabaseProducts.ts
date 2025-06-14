import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateProductData } from '@/utils/productValidation';
import { LoadingFallback } from '@/utils/loadingFallback';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  category?: string;
  main_image?: string;
  images?: string[];
  colors?: string[];
  sizes?: Array<{ size: string; stock: number; price?: number }>;
  discount?: number;
  featured?: boolean;
  stock?: number;
  inventory?: number;
  user_id?: string;
  [key: string]: any;
}

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  // fetch all products with their correct category_id (fresh from DB always)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Start loading timeout fallback
      LoadingFallback.startTimeout('product-fetch', 5000, () => {
        setLoading(false);
        setProducts([]);
      });
      
      console.log('🔄 Fetching products with public access...');
      
      // Fetch products without authentication requirement
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Clear loading timeout
      LoadingFallback.clearTimeout('product-fetch');
      
      if (error) {
        console.error('❌ Error fetching products:', error);
        toast.error('Failed to load products: ' + error.message);
        setProducts([]);
        return;
      }
      
      console.log('✅ Raw products fetched:', data?.length || 0);
      
      // Validate and clean product data
      const validatedProducts = (data || [])
        .map(validateProductData)
        .filter((product): product is Product => product !== null);
      
      console.log('✅ Validated products:', validatedProducts.length);
      setProducts(data || []);
      
    } catch (error: any) {
      LoadingFallback.clearTimeout('product-fetch');
      console.error('💥 Exception while fetching products:', error);
      toast.error('Failed to load products: ' + error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const { addProduct, updateProduct, deleteProduct } = useProductOperations();

  const handleAddProduct = async (productData: any) => {
    const result = await addProduct(productData);
    if (result) {
      await refetch();
    }
    return result;
  };

  const handleUpdateProduct = async (id: string, updates: any) => {
    const result = await updateProduct(id, updates);
    if (result) {
      await refetch();
    }
    return result;
  };

  const handleDeleteProduct = async (id: string) => {
    const result = await deleteProduct(id);
    if (result) {
      await refetch();
    }
    return result;
  };

  return { 
    products, 
    loading, 
    addProduct: handleAddProduct, 
    updateProduct: handleUpdateProduct, 
    deleteProduct: handleDeleteProduct, 
    refetch 
  };
};
