import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  status: string;
  product_count: number;
}

export interface VendorDetails extends Vendor {
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_active_vendors');

      if (fetchError) {
        console.error('Error fetching vendors:', fetchError);
        setError(fetchError.message);
        return;
      }

      setVendors((data || []) as Vendor[]);
    } catch (err) {
      console.error('Error in fetchVendors:', err);
      setError('فشل في تحميل المتاجر');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return {
    vendors,
    loading,
    error,
    refetch: fetchVendors
  };
};

export const useVendorBySlug = (slug: string) => {
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendor = useCallback(async () => {
    if (!slug) {
      setVendor(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('vendors')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching vendor:', fetchError);
        setError(fetchError.message);
        return;
      }

      setVendor(data as VendorDetails | null);
    } catch (err) {
      console.error('Error in fetchVendor:', err);
      setError('فشل في تحميل بيانات المتجر');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  return {
    vendor,
    loading,
    error,
    refetch: fetchVendor
  };
};

export const useVendorProducts = (vendorSlug: string, searchQuery?: string) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!vendorSlug) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First get vendor ID from slug
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('slug', vendorSlug)
        .eq('status', 'active')
        .maybeSingle();

      if (vendorError || !vendorData) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Then fetch products for this vendor
      let query = supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .in('status', ['active', 'approved']);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching vendor products:', fetchError);
        setError(fetchError.message);
        return;
      }

      setProducts(data || []);
    } catch (err) {
      console.error('Error in fetchVendorProducts:', err);
      setError('فشل في تحميل منتجات المتجر');
    } finally {
      setLoading(false);
    }
  }, [vendorSlug, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};
