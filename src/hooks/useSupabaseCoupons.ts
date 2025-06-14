
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
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching coupons:', error);
        toast.error('Failed to load coupons: ' + error.message);
        setCoupons([]);
        return;
      }
      
      console.log('✅ Coupons fetched:', data?.length || 0);
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
        .single();

      if (error || !data) {
        console.log('❌ Coupon not found:', error);
        toast.error('Invalid coupon code');
        return null;
      }

      const coupon = {
        ...data,
        discount_type: data.discount_type as 'percentage' | 'fixed'
      } as Coupon;

      console.log('✅ Found coupon in DB:', coupon);

      // FIXED: Check if coupon is active first
      if (!coupon.is_active) {
        console.log('❌ Coupon is not active');
        toast.error('This coupon is not active');
        return null;
      }

      // FIXED: Check expiration date properly
      if (coupon.expiration_date) {
        const expirationDate = new Date(coupon.expiration_date);
        const currentDate = new Date();
        
        // Reset time to compare only dates
        expirationDate.setHours(23, 59, 59, 999);
        currentDate.setHours(0, 0, 0, 0);
        
        console.log('📅 Checking expiration:', {
          expiration: expirationDate.toISOString(),
          current: currentDate.toISOString(),
          expired: expirationDate < currentDate
        });
        
        if (expirationDate < currentDate) {
          console.log('❌ Coupon expired');
          toast.error('This coupon has expired');
          return null;
        }
      }

      // FIXED: Check usage limit properly
      if (coupon.usage_limit !== null && coupon.usage_limit !== undefined) {
        if (coupon.used_count >= coupon.usage_limit) {
          console.log('❌ Coupon usage limit reached:', {
            used: coupon.used_count,
            limit: coupon.usage_limit
          });
          toast.error('This coupon has reached its usage limit');
          return null;
        }
      }

      // FIXED: Check minimum amount properly
      if (coupon.minimum_amount && orderTotal < coupon.minimum_amount) {
        console.log('❌ Order total below minimum amount:', {
          orderTotal,
          minimumRequired: coupon.minimum_amount
        });
        toast.error(`Minimum order amount of ${coupon.minimum_amount} EGP required for this coupon`);
        return null;
      }

      console.log('✅ Coupon validation successful - all checks passed');
      toast.success('Coupon applied successfully!');
      return coupon;
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      toast.error('Failed to validate coupon');
      return null;
    }
  };

  const applyCoupon = async (couponId: string): Promise<boolean> => {
    try {
      console.log('🔄 Applying coupon:', couponId);
      
      // Get current coupon data
      const { data: currentCoupon, error: fetchError } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', couponId)
        .single();

      if (fetchError || !currentCoupon) {
        console.error('Error fetching current coupon:', fetchError);
        return false;
      }

      // FIXED: Increment usage count properly
      const { error: updateError } = await supabase
        .from('coupons')
        .update({ 
          used_count: currentCoupon.used_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', couponId);

      if (updateError) {
        console.error('Error applying coupon:', updateError);
        return false;
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
