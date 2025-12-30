import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  status: string;
  product_count?: number;
  description?: string;
}

export const useVendors = (searchQuery?: string) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, [searchQuery]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      // التعديل هنا: بنقرأ من vendor_profiles مش من rpc
      let query = supabase
        .from('vendor_profiles') // ده الجدول اللي الفورم بتكتب فيه
        .select('*');

      if (searchQuery) {
        query = query.ilike('store_name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // بنعمل Mapping عشان نوحد الأسماء (store_name لـ name)
      const mappedVendors: Vendor[] = (data || []).map((v: any) => ({
        id: v.id,
        name: v.store_name, // بناخد الاسم من store_name
        slug: v.id,         // مؤقتاً بنستخدم الـ id كـ slug
        logo_url: v.logo_url,
        cover_url: null,
        status: v.status,
        description: v.store_description,
        product_count: 0
      }));
      
      setVendors(mappedVendors);
    } catch (err: any) {
      console.error('Error fetching vendors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { vendors, loading, error, refetch: fetchVendors };
};

// ... (سيب باقي الدوال زي useVendorBySlug زي ما هي مؤقتاً)
export const useVendorBySlug = (slug: string | undefined) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    fetchVendor();
  }, [slug]);

  const fetchVendor = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      // هنا كمان لازم نقرأ من vendor_profiles عشان صفحة المتجر تفتح
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', slug) // لأننا استخدمنا الـ id كـ slug فوق
        .single();
      
      if (error) throw error;
      
      // Mapping لنفس السبب
      const mappedVendor: Vendor = {
        id: data.id,
        name: data.store_name,
        slug: data.id,
        logo_url: data.logo_url,
        cover_url: null,
        status: data.status,
        description: data.store_description
      };

      setVendor(mappedVendor);
    } catch (err: any) {
      console.error('Error fetching vendor:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { vendor, loading, error };
};

// ... (باقي الملف سيبه زي ما هو)
export const useVendorProducts = (vendorId: string | undefined, categoryId?: string | null, searchQuery?: string) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    fetchProducts();
  }, [vendorId, categoryId, searchQuery]);

  const fetchProducts = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        // لاحظ: products مربوطة بـ user_id مش vendor_id في الداتا بيز بتاعتك غالباً
        // لو مظهرتش منتجات، هنحتاج نعدل دي لـ .eq('user_id', vendorId)
        .eq('vendor_id', vendorId) 
        .in('status', ['active', 'approved']);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      if (searchQuery?.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching vendor products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
};

export const useVendorCategories = (vendorId: string | undefined) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    fetchCategories();
  }, [vendorId]);

  const fetchCategories = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('category_id')
        .eq('vendor_id', vendorId)
        .in('status', ['active', 'approved'])
        .not('category_id', 'is', null);
      
      if (error) throw error;
      
      const categoryIds = [...new Set(products?.map(p => p.category_id).filter(Boolean))];
      
      if (categoryIds.length === 0) {
        setCategories([]);
        return;
      }
      
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .in('id', categoryIds)
        .eq('is_active', true);
      
      if (catError) throw catError;
      
      setCategories(categoriesData || []);
    } catch (err: any) {
      console.error('Error fetching vendor categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading };
};
