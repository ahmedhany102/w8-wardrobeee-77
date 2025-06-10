
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiration_date?: string;
  usage_limit?: number;
  used_count: number;
  minimum_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSupabaseCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching coupons...');
      
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching coupons:', error);
        toast.error('Failed to load coupons: ' + error.message);
        setCoupons([]);
        return;
      }
      
      console.log('✅ Coupons fetched:', data?.length || 0);
      // Type assertion to ensure discount_type is properly typed
      const typedCoupons = (data || []).map(coupon => ({
        ...coupon,
        discount_type: coupon.discount_type as 'percentage' | 'fixed'
      })) as Coupon[];
      setCoupons(typedCoupons);
      
    } catch (error: any) {
      console.error('💥 Exception while fetching coupons:', error);
      toast.error('Failed to load coupons: ' + error.message);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async (code: string, orderTotal: number): Promise<Coupon | null> => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Invalid coupon code');
        return null;
      }

      const coupon = {
        ...data,
        discount_type: data.discount_type as 'percentage' | 'fixed'
      } as Coupon;

      // Check expiration
      if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
        toast.error('This coupon has expired');
        return null;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        toast.error('This coupon has reached its usage limit');
        return null;
      }

      // Check minimum amount
      if (coupon.minimum_amount && orderTotal < coupon.minimum_amount) {
        toast.error(`Minimum order amount of ${coupon.minimum_amount} EGP required for this coupon`);
        return null;
      }

      return coupon;
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      toast.error('Failed to validate coupon');
      return null;
    }
  };

  return { 
    coupons, 
    loading, 
    validateCoupon,
    refetch: fetchCoupons 
  };
};
