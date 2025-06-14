
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
  category?: string;
  category_id?: string;
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
      
      // Process and clean the data
      const cleanedProducts = (data || []).map(product => ({
        ...product,
        images: Array.isArray(product.images) ? product.images : 
                 typeof product.images === 'string' ? JSON.parse(product.images) : [],
        colors: Array.isArray(product.colors) ? product.colors : 
                typeof product.colors === 'string' ? JSON.parse(product.colors) : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : 
               typeof product.sizes === 'string' ? JSON.parse(product.sizes) : []
      }));
      
      console.log('✅ Cleaned products:', cleanedProducts.length);
      setProducts(cleanedProducts);
      
    } catch (error: any) {
      LoadingFallback.clearTimeout('product-fetch');
      console.error('💥 Exception while fetching products:', error);
      toast.error('Failed to load products: ' + error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: any) => {
    try {
      console.log('🆕 Adding product:', productData);
      
      // Insert and immediately select the created product
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Error adding product:', error);
        toast.error('Failed to add product: ' + error.message);
        return false;
      }
      
      console.log('✅ Product added successfully:', data);
      
      // Refresh the products list from database
      await fetchProducts();
      
      return true;
    } catch (error: any) {
      console.error('💥 Exception adding product:', error);
      toast.error('Failed to add product: ' + error.message);
      return false;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      console.log('✏️ Updating product:', id, updates);
      
      // Update and immediately select the updated product
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Error updating product:', error);
        toast.error('Failed to update product: ' + error.message);
        return false;
      }
      
      console.log('✅ Product updated successfully:', data);
      
      // Refresh the products list from database
      await fetchProducts();
      
      return true;
    } catch (error: any) {
      console.error('💥 Exception updating product:', error);
      toast.error('Failed to update product: ' + error.message);
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('🗑️ Deleting product:', id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error deleting product:', error);
        toast.error('Failed to delete product: ' + error.message);
        return false;
      }
      
      console.log('✅ Product deleted successfully');
      
      // Refresh the products list from database
      await fetchProducts();
      
      return true;
    } catch (error: any) {
      console.error('💥 Exception deleting product:', error);
      toast.error('Failed to delete product: ' + error.message);
      return false;
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
