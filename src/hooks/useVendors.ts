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
  owner_id?: string;
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
      
      // Use vendor_profiles table which has logo and cover images
      let query = supabase
        .from('vendor_profiles')
        .select('*')
        .eq('status', 'approved'); // Only show approved vendors

      if (searchQuery) {
        query = query.ilike('store_name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map vendor_profiles fields to Vendor interface
      const mappedVendors: Vendor[] = (data || []).map((v: any) => ({
        id: v.id,
        name: v.store_name,
        slug: v.slug || v.id,
        logo_url: v.logo_url,
        cover_url: v.cover_url,
        status: v.status,
        description: v.store_description,
        owner_id: v.user_id,
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

// Fetch vendor by slug (SEO-friendly URL)
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
      
      // Try to find by slug in vendor_profiles table
      let { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .maybeSingle();
      
      // If not found by slug, try by id (backwards compatibility)
      if (!data && !error) {
        const { data: dataById, error: errorById } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('id', slug)
          .eq('status', 'approved')
          .maybeSingle();
        
        data = dataById;
        error = errorById;
      }
      
      if (error) throw error;
      
      if (!data) {
        setVendor(null);
        return;
      }
      
      // Map to Vendor interface
      const mappedVendor: Vendor = {
        id: data.id,
        name: data.store_name,
        slug: data.slug || data.id,
        logo_url: data.logo_url,
        cover_url: data.cover_url,
        status: data.status,
        description: data.store_description,
        owner_id: data.user_id
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

// Fetch products for a specific vendor
export const useVendorProducts = (vendorId: string | undefined, categoryId?: string | null, searchQuery?: string) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setProducts([]);
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

// Fetch categories that a vendor has products in
export const useVendorCategories = (vendorId: string | undefined) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) {
      setCategories([]);
      setLoading(false);
      return;
    }
    fetchCategories();
  }, [vendorId]);

  const fetchCategories = async () => {
    if (!vendorId) return;
    
    try {
      setLoading(true);
      
      // Get distinct category_ids from vendor's products
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
