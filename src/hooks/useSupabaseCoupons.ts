import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_type: string; // Changed from 'percentage' | 'fixed' to string to match database
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
      console.log('🔄 Fetching coupons from Supabase...');
      
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
      setCoupons(data || []);
      
    } catch (error: any) {
      console.error('💥 Exception while fetching coupons:', error);
      toast.error('Failed to load coupons: ' + error.message);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const addCoupon = async (couponData: any) => {
    try {
      console.log('🆕 Adding coupon to database:', couponData);
      
      const cleanData = {
        code: couponData.code?.trim().toUpperCase() || '',
        discount_type: couponData.discount_type || 'percentage',
        discount_value: Number(couponData.discount_value) || 0,
        expiration_date: couponData.expiration_date || null,
        usage_limit: couponData.usage_limit ? Number(couponData.usage_limit) : null,
        used_count: 0,
        minimum_amount: Number(couponData.minimum_amount) || 0,
        is_active: Boolean(couponData.is_active ?? true)
      };

      const { data, error } = await supabase
        .from('coupons')
        .insert(cleanData)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Failed to add coupon:', error);
        toast.error('Failed to add coupon: ' + error.message);
        return null;
      }

      console.log('✅ Coupon added successfully:', data);
      toast.success('Coupon added successfully!');
      
      // Refresh the coupons list
      await fetchCoupons();
      return data;
    } catch (error: any) {
      console.error('💥 Exception while adding coupon:', error);
      toast.error('Failed to add coupon: ' + error.message);
      return null;
    }
  };

  const updateCoupon = async (id: string, updates: any) => {
    try {
      console.log('✏️ Updating coupon:', id, updates);
      
      const cleanUpdates: any = {};
      
      if (updates.code !== undefined) cleanUpdates.code = updates.code?.trim().toUpperCase() || '';
      if (updates.discount_type !== undefined) cleanUpdates.discount_type = updates.discount_type;
      if (updates.discount_value !== undefined) cleanUpdates.discount_value = Number(updates.discount_value) || 0;
      if (updates.expiration_date !== undefined) cleanUpdates.expiration_date = updates.expiration_date || null;
      if (updates.usage_limit !== undefined) cleanUpdates.usage_limit = updates.usage_limit ? Number(updates.usage_limit) : null;
      if (updates.minimum_amount !== undefined) cleanUpdates.minimum_amount = Number(updates.minimum_amount) || 0;
      if (updates.is_active !== undefined) cleanUpdates.is_active = Boolean(updates.is_active);

      const { data, error } = await supabase
        .from('coupons')
        .update(cleanUpdates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Failed to update coupon:', error);
        toast.error('Failed to update coupon: ' + error.message);
        return null;
      }

      console.log('✅ Coupon updated successfully:', data);
      toast.success('Coupon updated successfully!');
      
      // Refresh the coupons list
      await fetchCoupons();
      return data;
    } catch (error: any) {
      console.error('💥 Exception while updating coupon:', error);
      toast.error('Failed to update coupon: ' + error.message);
      return null;
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      console.log('🗑️ Deleting coupon:', id);
      
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Failed to delete coupon:', error);
        toast.error('Failed to delete coupon: ' + error.message);
        return null;
      }

      console.log('✅ Coupon deleted successfully');
      toast.success('Coupon deleted successfully!');
      
      // Refresh the coupons list
      await fetchCoupons();
      return true;
    } catch (error: any) {
      console.error('💥 Exception while deleting coupon:', error);
      toast.error('Failed to delete coupon: ' + error.message);
      return null;
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

      const coupon = data as Coupon;

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
    addCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    refetch: fetchCoupons 
  };
};
