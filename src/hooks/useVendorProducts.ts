import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ProductFormData } from '@/types/product';
import { cleanProductDataForInsert, formatProductForDisplay } from '@/utils/productUtils';

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
  vendor_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useVendorProducts = (statusFilter?: string) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // دالة جلب المنتجات (للبائع)
  const fetchProducts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 1. نجيب المتجر الأول
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!vendor) {
        setProducts([]);
        return;
      }

      // 2. نجيب المنتجات بناءً على vendor_id
      let query = supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendor.id);

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = (data || []).map(formatProductForDisplay);
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching vendor products:', error);
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // دالة إضافة المنتج (الإصلاح الجذري هنا)
  const addProduct = async (productData: ProductFormData): Promise<{ id: string } | null> => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return null;
    }

    try {
      // 1. لازم نجيب الـ ID بتاع المتجر من جدول vendors
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (vendorError || !vendor) {
        toast.error('لم يتم العثور على متجر! تأكد من إنشاء متجر أولاً.');
        return null;
      }

      // 2. تجهيز البيانات
      const cleanData = cleanProductDataForInsert(productData, user.id);
      
      // 3. الإضافة مع vendor_id والحالة active
      const dataWithVendor = { 
        ...cleanData, 
        vendor_id: vendor.id, 
        status: 'active' 
      };

      const { data, error } = await supabase
        .from('products')
        .insert(dataWithVendor)
        .select()
        .single();

      if (error) throw error;

      // حفظ الألوان والمقاسات (Product Variants)
      const pendingVariants = (window as any).__pendingColorVariants;
      if (pendingVariants && pendingVariants.length > 0 && data?.id) {
        const { ProductVariantService } = await import('@/services/productVariantService');
        await ProductVariantService.saveProductVariants(data.id, pendingVariants);
        delete (window as any).__pendingColorVariants;
      }

      toast.success('تم إضافة المنتج للمتجر بنجاح!');
      await fetchProducts();
      return { id: data.id };
    } catch (error: any) {
      console.error('Error in addProduct:', error);
      toast.error('حدث خطأ: ' + error.message);
      return null;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<ProductFormData>): Promise<boolean> => {
    if (!user) return false;
    try {
      const cleanUpdates: any = { ...updates, updated_at: new Date().toISOString() };
      
      // تنظيف الأرقام
      if (updates.price) cleanUpdates.price = Number(updates.price);
      if (updates.stock) cleanUpdates.stock = Number(updates.stock);
      if (updates.inventory) cleanUpdates.inventory = Number(updates.inventory);
      if (updates.discount) cleanUpdates.discount = Number(updates.discount);

      const { error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', productId)
        .eq('user_id', user.id); // التحقق من الملكية

      if (error) throw error;

      // تحديث الفاريانتس
      const pendingVariants = (window as any).__pendingColorVariants;
      if (pendingVariants && pendingVariants.length > 0) {
        const { ProductVariantService } = await import('@/services/productVariantService');
        await ProductVariantService.saveProductVariants(productId, pendingVariants);
        delete (window as any).__pendingColorVariants;
      }

      toast.success('تم تحديث المنتج');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Update Error:', error);
      toast.error('فشل التحديث');
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('تم حذف المنتج');
      await fetchProducts();
      return true;
    } catch (error) {
      console.error('Delete Error:', error);
      toast.error('فشل الحذف');
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

// ==========================================
// Admin Hook (رجعتلك الكود ده كامل عشان لوحة التحكم تشتغل)
// ==========================================
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
      // الأدمن بيجيب داتا أشمل، فممكن نستخدم RPC أو كويري عادي
      // هنا هنستخدم كويري عادي عشان نتجنب مشاكل RPC القديمة
      let query = supabase
        .from('products')
        .select(`
          *,
          vendor:vendors(name)
        `);

      if (vendorFilter) {
        query = query.eq('vendor_id', vendorFilter);
      }
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = (data || []).map(formatProductForDisplay);
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Admin fetch error:', error);
      toast.error('فشل تحميل المنتجات للأدمن');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, vendorFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateProductStatus = async (productId: string, newStatus: string): Promise<boolean> => {
    if (!user || !isAdmin) return false;
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;
      toast.success('تم تحديث الحالة');
      await fetchProducts();
      return true;
    } catch (err) {
      toast.error('فشل التحديث');
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    if (!user || !isAdmin) return false;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('تم الحذف');
      await fetchProducts();
      return true;
    } catch (err) {
      toast.error('فشل الحذف');
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
