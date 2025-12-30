import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ProductFormData } from '@/types/product';
import { cleanProductDataForInsert } from '@/utils/productUtils';
import { formatProductForDisplay } from '@/utils/productUtils';

export interface VendorProduct {
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
  sizes?: any[];
  discount?: number;
  featured?: boolean;
  stock?: number;
  inventory?: number;
  status?: string;
  user_id?: string;
  vendor_id?: string; // تأكدنا من وجود هذا الحقل
  created_at?: string;
  updated_at?: string;
}

export const useVendorProducts = (statusFilter?: string) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_vendor_products', {
        _vendor_id: null,
        _status_filter: statusFilter || 'all'
      });

      if (error) {
        console.error('Error fetching vendor products:', error);
        toast.error('فشل في تحميل المنتجات');
        return;
      }

      const formattedProducts = (data || []).map(formatProductForDisplay);
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      toast.error('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============================================================
  // التعديل الجذري هنا (إصلاح مشكلة عدم ظهور المنتج في المتجر)
  // ============================================================
  const addProduct = async (productData: ProductFormData): Promise<{ id: string } | null> => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return null;
    }

    try {
      // 1. الخطوة الجديدة: لازم نجيب الـ ID بتاع المتجر من جدول vendor_profiles
      // عشان نربط المنتج بالمتجر، وإلا مش هيظهر في صفحة المتجر
      const { data: vendorProfile, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (vendorError || !vendorProfile) {
        toast.error('عفواً، لا يوجد متجر مرتبط بهذا الحساب. يرجى إنشاء متجر أولاً.');
        return null;
      }

      const cleanData = cleanProductDataForInsert(productData, user.id);
      
      // 2. دمج بيانات المنتج مع vendor_id
      // تم تغيير الحالة إلى active عشان المنتج يظهر فوراً وتتأكد إنه شغال
      const dataWithStatus = { 
        ...cleanData, 
        vendor_id: vendorProfile.id, // <--- ده السطر اللي كان ناقص
        status: 'active'             // <--- خليناها active للظهور الفوري
      };

      const { data, error } = await supabase
        .from('products')
        .insert(dataWithStatus)
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        toast.error('فشل في إضافة المنتج: ' + error.message);
        return null;
      }

      // كود حفظ الألوان والمقاسات (زي ما هو)
      const pendingVariants = (window as any).__pendingColorVariants;
      if (pendingVariants && pendingVariants.length > 0 && data?.id) {
        const { ProductVariantService } = await import('@/services/productVariantService');
        const variantsSaved = await ProductVariantService.saveProductVariants(data.id, pendingVariants);
        if (!variantsSaved) {
          console.warn('Failed to save color variants');
        }
        delete (window as any).__pendingColorVariants;
      }

      toast.success('تم إضافة المنتج للمتجر بنجاح!');
      await fetchProducts();
      return { id: data.id };
    } catch (error) {
      console.error('Error in addProduct:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج');
      return null;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<ProductFormData>): Promise<boolean> => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    try {
      const cleanUpdates: any = {};
      if (updates.name !== undefined) cleanUpdates.name = updates.name;
      if (updates.description !== undefined) cleanUpdates.description = updates.description;
      if (updates.price !== undefined) cleanUpdates.price = Number(updates.price);
      if (updates.category !== undefined) cleanUpdates.category = updates.category;
      if (updates.main_image !== undefined) cleanUpdates.main_image = updates.main_image;
      if (updates.images !== undefined) cleanUpdates.images = updates.images;
      if (updates.colors !== undefined) cleanUpdates.colors = updates.colors;
      if (updates.sizes !== undefined) cleanUpdates.sizes = updates.sizes;
      if (updates.discount !== undefined) cleanUpdates.discount = Number(updates.discount);
      if (updates.featured !== undefined) cleanUpdates.featured = updates.featured;
      if (updates.stock !== undefined) cleanUpdates.stock = Number(updates.stock);
      if (updates.inventory !== undefined) cleanUpdates.inventory = Number(updates.inventory);
      
      cleanUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating product:', error);
        toast.error('فشل في تحديث المنتج');
        return false;
      }

      const pendingVariants = (window as any).__pendingColorVariants;
      if (pendingVariants && pendingVariants.length > 0) {
        const { ProductVariantService } = await import('@/services/productVariantService');
        const variantsSaved = await ProductVariantService.saveProductVariants(productId, pendingVariants);
        if (!variantsSaved) {
          console.warn('Failed to save color variants');
        }
        delete (window as any).__pendingColorVariants;
      }

      toast.success('تم تحديث المنتج بنجاح');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      toast.error('حدث خطأ أثناء تحديث المنتج');
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('فشل في حذف المنتج');
        return false;
      }

      toast.success('تم حذف المنتج بنجاح');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      toast.error('حدث خطأ أثناء حذف المنتج');
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

// ============================================================
// كود الأدمن موجود بالكامل في الأسفل ولم يتم حذفه
// ============================================================
export const useAdminProducts = (vendorFilter?: string, statusFilter?: string) => {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_vendor_products', {
        _vendor_id: vendorFilter || null,
        _status_filter: statusFilter || 'all'
      });

      if (error) {
        console.error('Error fetching admin products:', error);
        toast.error('فشل في تحميل المنتجات');
        return;
      }

      const formattedProducts = (data || []).map(formatProductForDisplay);
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      toast.error('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, vendorFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateProductStatus = async (productId: string, newStatus: string): Promise<boolean> => {
    if (!user || !isAdmin) {
      toast.error('ليس لديك صلاحية لتغيير حالة المنتج');
      return false;
    }

    try {
      const { error } = await supabase.rpc('update_product_status', {
        _product_id: productId,
        _new_status: newStatus
      });

      if (error) {
        console.error('Error updating product status:', error);
        toast.error('فشل في تحديث حالة المنتج');
        return false;
      }

      toast.success('تم تحديث حالة المنتج بنجاح');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error in updateProductStatus:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المنتج');
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    if (!user || !isAdmin) {
      toast.error('ليس لديك صلاحية لحذف المنتج');
      return false;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('فشل في حذف المنتج');
        return false;
      }

      toast.success('تم حذف المنتج بنجاح');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      toast.error('حدث خطأ أثناء حذف المنتج');
      return false;
    }
  };

  return {
    products,
    loading,
    updateProductStatus,
    deleteProduct,
    refetch: fetchProducts
  };
};
