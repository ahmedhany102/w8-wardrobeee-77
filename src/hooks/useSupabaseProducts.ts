
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductFormData, ProductUpdateData } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { validateRequiredFields, validateUpdateFields, cleanProductDataForInsert } from '@/utils/productUtils';

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

// Safe product data validation helper
const validateProductData = (product: any): Product | null => {
  if (!product || typeof product !== 'object') {
    console.warn('⚠️ Invalid product data:', product);
    return null;
  }

  // Ensure sizes is always an array
  if (product.sizes && !Array.isArray(product.sizes)) {
    console.warn('⚠️ Product sizes is not an array, converting:', product.sizes);
    try {
      product.sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : [];
    } catch {
      product.sizes = [];
    }
  }

  // Ensure colors is always an array
  if (product.colors && !Array.isArray(product.colors)) {
    console.warn('⚠️ Product colors is not an array, converting:', product.colors);
    try {
      product.colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : [];
    } catch {
      product.colors = [];
    }
  }

  // Ensure images is always an array
  if (product.images && !Array.isArray(product.images)) {
    console.warn('⚠️ Product images is not an array, converting:', product.images);
    try {
      product.images = typeof product.images === 'string' ? JSON.parse(product.images) : [];
    } catch {
      product.images = [];
    }
  }

  // Set defaults for missing fields
  return {
    ...product,
    sizes: product.sizes || [],
    colors: product.colors || [],
    images: product.images || [],
    price: typeof product.price === 'number' ? product.price : 0,
    name: product.name || 'Unnamed Product',
    description: product.description || ''
  };
};

export const useSupabaseProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Always fetch products regardless of auth state for public visibility
    fetchProducts();
  }, [user, isAdmin]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products with public access...');
      
      let query = supabase.from('products').select('*');
      
      // Products are now publicly visible thanks to RLS policy
      const { data, error } = await query.order('created_at', { ascending: false });
      
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
      setProducts(validatedProducts);
      
    } catch (error: any) {
      console.error('💥 Exception while fetching products:', error);
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
      console.log('🎯 Adding product with complete data validation...', productData);
      
      const validationError = validateRequiredFields(productData);
      if (validationError) {
        toast.error(validationError);
        return null;
      }

      const userId = user.id;
      const cleanData = cleanProductDataForInsert(productData, userId);
      
      console.log('📤 Sending to database:', cleanData);
      
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
      await fetchProducts(); // Refresh the list
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

      const updateData: Record<string, any> = {};
      
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
      await fetchProducts(); // Refresh the list
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
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Failed to delete product:', error);
        toast.error('Failed to delete product: ' + error.message);
        return null;
      }

      console.log('✅ Product deleted successfully');
      await fetchProducts(); // Refresh the list
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
