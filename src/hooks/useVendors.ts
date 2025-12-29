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
}

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      // التعديل هنا: استدعاء مباشر من الجدول بدلاً من rpc
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('status', 'active') // جلب المتاجر النشطة فقط
        .order('created_at', { ascending: false }); // الأحدث أولاً
      
      if (error) throw error;
      
      setVendors(data || []);
    } catch (err: any) {
      console.error('Error fetching vendors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { vendors, loading, error, refetch: fetchVendors };
};

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
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      
      setVendor(data);
    } catch (err: any) {
      console.error('Error fetching vendor:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { vendor, loading, error };
};

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
      
      // Get unique category IDs from vendor's products
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
      
      // Fetch category details
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
