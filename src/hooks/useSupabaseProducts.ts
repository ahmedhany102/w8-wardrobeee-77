import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingFallback } from '@/utils/loadingFallback';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  category_id?: string;
  main_image?: string;
  image_url?: string;
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

  // Fetch all products with their correct category_id (fresh from DB always)
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
      
      // Process and clean the data to ensure consistent JSON structure
      const cleanedProducts = (data || []).map(product => {
        // Clean images field - properly cast Json to string[]
        let cleanImages: string[] = [];
        if (product.images) {
          if (Array.isArray(product.images)) {
            cleanImages = (product.images as unknown as string[]).filter(Boolean);
          } else if (typeof product.images === 'string') {
            try {
              const parsed = JSON.parse(product.images);
              cleanImages = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
            } catch (e) {
              console.warn('Failed to parse images JSON:', product.images);
              cleanImages = [];
            }
          }
        }
        
        // Clean colors field - properly cast Json to string[]
        let cleanColors: string[] = [];
        if (product.colors) {
          if (Array.isArray(product.colors)) {
            cleanColors = (product.colors as unknown as string[]).filter(Boolean);
          } else if (typeof product.colors === 'string') {
            try {
              const parsed = JSON.parse(product.colors);
              cleanColors = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
            } catch (e) {
              console.warn('Failed to parse colors JSON:', product.colors);
              cleanColors = [];
            }
          }
        }
        
        // Clean sizes field - properly cast Json to size objects array
        let cleanSizes: Array<{ size: string; stock: number; price?: number }> = [];
        if (product.sizes) {
          if (Array.isArray(product.sizes)) {
            cleanSizes = (product.sizes as unknown as any[])
              .filter(size => size && typeof size === 'object' && size.size)
              .map(size => ({
                size: String(size.size).trim(),
                stock: Number(size.stock) || 0,
                price: Number(size.price) || Number(product.price) || 0
              }));
          } else if (typeof product.sizes === 'string') {
            try {
              const parsed = JSON.parse(product.sizes);
              if (Array.isArray(parsed)) {
                cleanSizes = parsed
                  .filter(size => size && typeof size === 'object' && size.size)
                  .map(size => ({
                    size: String(size.size).trim(),
                    stock: Number(size.stock) || 0,
                    price: Number(size.price) || Number(product.price) || 0
                  }));
              }
            } catch (e) {
              console.warn('Failed to parse sizes JSON:', product.sizes);
              cleanSizes = [];
            }
          }
        }

        // CRITICAL: Log category_id to verify it's being saved/loaded correctly
        console.log('📦 Product:', product.name, 'Category ID:', product.category_id);

        return {
          ...product,
          images: cleanImages,
          colors: cleanColors,
          sizes: cleanSizes,
          price: Number(product.price) || 0,
          discount: Number(product.discount) || 0,
          stock: Number(product.stock) || 0,
          inventory: Number(product.inventory) || 0,
          // CRITICAL: Ensure category_id is preserved
          category_id: product.category_id
        };
      });
      
      console.log('✅ Cleaned products:', cleanedProducts.length);
      console.log('📊 Sample product structure:', cleanedProducts[0]);
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
      console.log('🆕 Adding product with data:', productData);
      console.log('🎯 CRITICAL - Category ID being saved:', productData.category_id);
      
      // Ensure data is properly formatted for database
      const cleanProductData = {
        ...productData,
        // CRITICAL: Ensure category_id is included
        category_id: productData.category_id,
        // Ensure arrays are properly formatted as JSON
        images: Array.isArray(productData.images) ? productData.images : [],
        colors: Array.isArray(productData.colors) ? productData.colors : [],
        sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
        // Ensure numbers are properly formatted
        price: Number(productData.price) || 0,
        discount: Number(productData.discount) || 0,
        stock: Number(productData.stock) || 0,
        inventory: Number(productData.inventory) || 0
      };
      
      console.log('📤 Final data being sent to DB:', cleanProductData);
      
      // Insert and immediately select the created product
      const { data, error } = await supabase
        .from('products')
        .insert([cleanProductData])
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Error adding product:', error);
        toast.error('Failed to add product: ' + error.message);
        return false;
      }
      
      console.log('✅ Product added successfully:', data);
      console.log('🎯 VERIFICATION - Saved category_id:', data.category_id);
      toast.success('Product added successfully!');
      
      // Refresh the products list from database immediately
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
      
      // Ensure data is properly formatted for database
      const cleanUpdates = {
        ...updates,
        // Ensure arrays are properly formatted as JSON
        images: Array.isArray(updates.images) ? updates.images : updates.images ? [updates.images] : [],
        colors: Array.isArray(updates.colors) ? updates.colors : updates.colors ? [updates.colors] : [],
        sizes: Array.isArray(updates.sizes) ? updates.sizes : updates.sizes ? [updates.sizes] : [],
        // Ensure numbers are properly formatted
        price: updates.price !== undefined ? Number(updates.price) : undefined,
        discount: updates.discount !== undefined ? Number(updates.discount) : undefined,
        stock: updates.stock !== undefined ? Number(updates.stock) : undefined,
        inventory: updates.inventory !== undefined ? Number(updates.inventory) : undefined
      };
      
      // Remove undefined values
      Object.keys(cleanUpdates).forEach(key => {
        if (cleanUpdates[key] === undefined) {
          delete cleanUpdates[key];
        }
      });
      
      // Update and immediately select the updated product
      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Error updating product:', error);
        toast.error('Failed to update product: ' + error.message);
        return false;
      }
      
      console.log('✅ Product updated successfully:', data);
      toast.success('Product updated successfully!');
      
      // Refresh the products list from database immediately
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
      toast.success('Product deleted successfully!');
      
      // Refresh the products list from database immediately
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
