import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Section, SectionProduct } from '@/types/section';

export function useSections(scope: 'global' | 'vendor' = 'global', vendorId?: string) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_sections_by_scope', {
            _scope: scope,
            _vendor_id: vendorId || null
          });

        if (error) throw error;
        setSections((data as Section[]) || []);
      } catch (err) {
        console.error('Error fetching sections:', err);
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [scope, vendorId]);

  return { sections, loading };
}

export function useSectionProducts(sectionId: string, limit: number = 12) {
  const [products, setProducts] = useState<SectionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!sectionId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_section_products', {
            _section_id: sectionId,
            _limit: limit
          });

        if (error) throw error;
        setProducts((data as SectionProduct[]) || []);
      } catch (err) {
        console.error('Error fetching section products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sectionId, limit]);

  return { products, loading };
}

export function useBestSellers(vendorId?: string, limit: number = 12) {
  const [products, setProducts] = useState<SectionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_best_seller_products', {
            _vendor_id: vendorId || null,
            _limit: limit
          });

        if (error) throw error;
        setProducts((data as SectionProduct[]) || []);
      } catch (err) {
        console.error('Error fetching best sellers:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [vendorId, limit]);

  return { products, loading };
}

export function useHotDeals(vendorId?: string, limit: number = 12) {
  const [products, setProducts] = useState<SectionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_hot_deals_products', {
            _vendor_id: vendorId || null,
            _limit: limit
          });

        if (error) throw error;
        setProducts((data as SectionProduct[]) || []);
      } catch (err) {
        console.error('Error fetching hot deals:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [vendorId, limit]);

  return { products, loading };
}

export function useLastViewed(vendorId?: string, limit: number = 10) {
  const [products, setProducts] = useState<SectionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Query product_views directly and join with products and vendors
        const { data, error } = await supabase
          .from('product_views')
          .select(`
            product_id,
            viewed_at,
            products!inner (
              id,
              name,
              price,
              image_url,
              main_image,
              discount,
              rating,
              vendor_id,
              status,
              vendors (
                name,
                slug,
                logo_url
              )
            )
          `)
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(limit * 2); // Fetch more to account for filtering

        if (error) throw error;

        // Filter by vendor if specified, and filter active products
        let filteredData = (data || []).filter((item: any) => {
          const product = item.products;
          if (!product) return false;
          if (product.status !== 'active' && product.status !== 'approved') return false;
          if (vendorId && product.vendor_id !== vendorId) return false;
          return true;
        }).slice(0, limit);

        // Map to SectionProduct format
        const mappedProducts: SectionProduct[] = filteredData.map((item: any) => {
          const product = item.products;
          const vendor = product.vendors;
          return {
            id: product.id,
            name: product.name || '',
            price: product.price || 0,
            image_url: product.main_image || product.image_url || '',
            discount: product.discount || 0,
            rating: product.rating || 0,
            vendor_name: vendor?.name || null,
            vendor_slug: vendor?.slug || null,
            vendor_logo_url: vendor?.logo_url || null,
          };
        });

        setProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching last viewed:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [vendorId, limit]);

  return { products, loading };
}

export function useCategoryProducts(categoryId: string, vendorId?: string, limit: number = 12) {
  const [products, setProducts] = useState<SectionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_category_products', {
            _category_id: categoryId,
            _vendor_id: vendorId || null,
            _limit: limit
          });

        if (error) throw error;
        setProducts((data as SectionProduct[]) || []);
      } catch (err) {
        console.error('Error fetching category products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, vendorId, limit]);

  return { products, loading };
}

export async function trackProductView(productId: string) {
  try {
    await supabase.rpc('track_product_view', { _product_id: productId });
  } catch (err) {
    console.error('Error tracking product view:', err);
  }
}
