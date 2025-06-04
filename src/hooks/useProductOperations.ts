
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductFormData, ProductUpdateData } from '@/types/product';
import { validateRequiredFields, validateUpdateFields, cleanProductDataForInsert, cleanProductDataForUpdate } from '@/utils/productUtils';

export const useProductOperations = () => {
  const addProduct = async (productData: ProductFormData) => {
    try {
      console.log('Adding product to Supabase:', productData);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        const errorMsg = 'You must be logged in to add products';
        console.error('User authentication error:', userError);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      const validationError = validateRequiredFields(productData);
      if (validationError) {
        console.error('Validation error:', validationError);
        toast.error(validationError);
        throw new Error(validationError);
      }

      const cleanProductData = cleanProductDataForInsert(productData, user.id);
      
      console.log('Cleaned product data for database insert:', cleanProductData);
      
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
      
      return data;
      
    } catch (error) {
      console.error('Exception in addProduct:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: ProductUpdateData) => {
    try {
      console.log('Updating product in database:', id, updates);
      
      if (!id) {
        const errorMsg = 'Product ID is required for update';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        const errorMsg = 'You must be logged in to update products';
        console.error('User authentication error:', userError);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const validationError = validateUpdateFields(updates);
      if (validationError) {
        console.error('Validation error:', validationError);
        toast.error(validationError);
        throw new Error(validationError);
      }

      const cleanUpdates = cleanProductDataForUpdate(updates);
      
      console.log('Cleaned update data:', cleanUpdates);
      
      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
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
      
      return data;
      
    } catch (error) {
      console.error('Exception in updateProduct:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('Deleting product from database:', id);
      
      if (!id) {
        const errorMsg = 'Product ID is required for deletion';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

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
        .eq('id', id);
      
      if (error) {
        console.error('Supabase delete error:', error);
        toast.error('Failed to delete product: ' + error.message);
        throw error;
      }
      
      console.log('Product successfully deleted from database');
      toast.success('Product deleted successfully');
      
      return true;
      
    } catch (error) {
      console.error('Exception in deleteProduct:', error);
      throw error;
    }
  };

  return { addProduct, updateProduct, deleteProduct };
};
