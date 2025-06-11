
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductSize {
  size: string;
  stock: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  category: string;
  main_image: string;
  images: string[];
  colors: string[];
  sizes: ProductSize[];
  discount: number;
  featured: boolean;
  stock: number;
  inventory: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products from Supabase...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching products:', error);
        toast.error('Failed to load products: ' + error.message);
        setProducts([]);
        return;
      }
      
      console.log('✅ Raw products fetched:', data?.length || 0);
      
      // Clean and format product data
      const formattedProducts = (data || []).map(product => ({
        ...product,
        images: Array.isArray(product.images) ? product.images : 
                typeof product.images === 'string' ? JSON.parse(product.images || '[]') : [],
        colors: Array.isArray(product.colors) ? product.colors : 
                typeof product.colors === 'string' ? JSON.parse(product.colors || '[]') : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : 
               typeof product.sizes === 'string' ? JSON.parse(product.sizes || '[]') : [],
        price: Number(product.price) || 0,
        discount: Number(product.discount) || 0,
        stock: Number(product.stock) || 0,
        inventory: Number(product.inventory) || 0
      }));
      
      console.log('✅ Formatted products:', formattedProducts.length);
      setProducts(formattedProducts);
      
    } catch (error: any) {
      console.error('💥 Exception while fetching products:', error);
      toast.error('Failed to load products: ' + error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: any) => {
    try {
      console.log('🆕 Adding product to database:', productData);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error('You must be logged in to add products');
        return null;
      }

      const cleanData = {
        user_id: userData.user.id,
        name: productData.name?.trim() || '',
        description: productData.description?.trim() || '',
        price: Number(productData.price) || 0,
        type: productData.type?.trim() || '',
        category: productData.category?.trim() || '',
        main_image: productData.main_image || productData.mainImage || '',
        images: Array.isArray(productData.images) ? productData.images : [],
        colors: Array.isArray(productData.colors) ? productData.colors : [],
        sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
        discount: Number(productData.discount) || 0,
        featured: Boolean(productData.featured),
        stock: Number(productData.stock) || Number(productData.inventory) || 0,
        inventory: Number(productData.inventory) || Number(productData.stock) || 0
      };

      const { data, error } = await supabase
        .from('products')
        .insert(cleanData)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Failed to add product:', error);
        toast.error('Failed to add product: ' + error.message);
        return null;
      }

      console.log('✅ Product added successfully:', data);
      toast.success('Product added successfully!');
      
      // Refresh the products list
      await fetchProducts();
      return data;
    } catch (error: any) {
      console.error('💥 Exception while adding product:', error);
      toast.error('Failed to add product: ' + error.message);
      return null;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      console.log('✏️ Updating product:', id, updates);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error('You must be logged in to update products');
        return null;
      }

      const cleanUpdates: any = {};
      
      if (updates.name !== undefined) cleanUpdates.name = updates.name?.trim() || '';
      if (updates.description !== undefined) cleanUpdates.description = updates.description?.trim() || '';
      if (updates.price !== undefined) cleanUpdates.price = Number(updates.price) || 0;
      if (updates.type !== undefined) cleanUpdates.type = updates.type?.trim() || '';
      if (updates.category !== undefined) cleanUpdates.category = updates.category?.trim() || '';
      if (updates.main_image !== undefined) cleanUpdates.main_image = updates.main_image || '';
      if (updates.images !== undefined) cleanUpdates.images = Array.isArray(updates.images) ? updates.images : [];
      if (updates.colors !== undefined) cleanUpdates.colors = Array.isArray(updates.colors) ? updates.colors : [];
      if (updates.sizes !== undefined) cleanUpdates.sizes = Array.isArray(updates.sizes) ? updates.sizes : [];
      if (updates.discount !== undefined) cleanUpdates.discount = Number(updates.discount) || 0;
      if (updates.featured !== undefined) cleanUpdates.featured = Boolean(updates.featured);
      if (updates.stock !== undefined) cleanUpdates.stock = Number(updates.stock) || 0;
      if (updates.inventory !== undefined) cleanUpdates.inventory = Number(updates.inventory) || 0;

      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Failed to update product:', error);
        toast.error('Failed to update product: ' + error.message);
        return null;
      }

      console.log('✅ Product updated successfully:', data);
      toast.success('Product updated successfully!');
      
      // Refresh the products list
      await fetchProducts();
      return data;
    } catch (error: any) {
      console.error('💥 Exception while updating product:', error);
      toast.error('Failed to update product: ' + error.message);
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('🗑️ Deleting product:', id);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error('You must be logged in to delete products');
        return null;
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('❌ Failed to delete product:', error);
        toast.error('Failed to delete product: ' + error.message);
        return null;
      }

      console.log('✅ Product deleted successfully');
      toast.success('Product deleted successfully!');
      
      // Refresh the products list
      await fetchProducts();
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
