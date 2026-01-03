import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SectionProduct } from '@/types/section';

/**
 * Hook to fetch similar products based on category
 */
export function useSimilarProducts(productId: string | undefined, limit: number = 8) {
  const [products, setProducts] = useState<SectionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_similar_products', {
          _product_id: productId,
          _limit: limit
        });

        if (error) {
          console.error('Error fetching similar products:', error);
          setProducts([]);
          return;
        }

        setProducts((data || []) as SectionProduct[]);
      } catch (err) {
        console.error('Exception fetching similar products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [productId, limit]);

  return { products, loading };
}

/**
 * Hook to fetch more products from the same vendor
 */
export function useMoreFromVendor(productId: string | undefined, vendorId: string | undefined, limit: number = 8) {
  const [products, setProducts] = useState<SectionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMore = async () => {
      if (!productId || !vendorId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_vendor_more_products', {
          _product_id: productId,
          _vendor_id: vendorId,
          _limit: limit
        });

        if (error) {
          console.error('Error fetching vendor products:', error);
          setProducts([]);
          return;
        }

        setProducts((data || []) as SectionProduct[]);
      } catch (err) {
        console.error('Exception fetching vendor products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMore();
  }, [productId, vendorId, limit]);

  return { products, loading };
}