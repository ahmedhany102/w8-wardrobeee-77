
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
      
      // Fetch ALL coupons (both active and inactive) for admin panel
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
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
      console.log('🔍 Validating coupon:', code, 'for order total:', orderTotal);
      
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log('❌ Coupon not found or inactive:', error);
        toast.error('Invalid coupon code');
        return null;
      }

      const coupon = {
        ...data,
        discount_type: data.discount_type as 'percentage' | 'fixed'
      } as Coupon;

      console.log('✅ Found coupon:', coupon);

      // Check expiration
      if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
        console.log('❌ Coupon expired');
        toast.error('This coupon has expired');
        return null;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        console.log('❌ Coupon usage limit reached');
        toast.error('This coupon has reached its usage limit');
        return null;
      }

      // Check minimum amount
      if (coupon.minimum_amount && orderTotal < coupon.minimum_amount) {
        console.log('❌ Order total below minimum amount');
        toast.error(`Minimum order amount of ${coupon.minimum_amount} EGP required for this coupon`);
        return null;
      }

      console.log('✅ Coupon validation successful');
      return coupon;
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      toast.error('Failed to validate coupon');
      return null;
    }
  };

  const applyCoupon = async (couponId: string): Promise<boolean> => {
    try {
      // Increment usage count using RPC call
      const { error } = await supabase.rpc('increment_coupon_usage', {
        coupon_id: couponId
      });

      if (error) {
        console.error('Error applying coupon:', error);
        // Fallback to manual increment
        const { error: updateError } = await supabase
          .from('coupons')
          .update({ 
            used_count: 0, // Will be updated by trigger if exists
            updated_at: new Date().toISOString()
          })
          .eq('id', couponId);
        
        if (updateError) {
          console.error('Error applying coupon (fallback):', updateError);
          return false;
        }
      }

      console.log('✅ Coupon applied successfully');
      return true;
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      return false;
    }
  };

  return { 
    coupons, 
    loading, 
    validateCoupon,
    applyCoupon,
    refetch: fetchCoupons 
  };
};
