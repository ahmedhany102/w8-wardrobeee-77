import { supabase } from '@/integrations/supabase/client';

export class CouponService {
  // ✅ Validate coupon correctness and calculate discount
  static async validateCoupon(code: string, orderTotal: number) {
    try {
      console.log('🎟️ Validating coupon:', code, 'for order total:', orderTotal);

      // Normalize the code for comparison
      const normalizedCode = code.toUpperCase().trim();

      // Query coupon with case-insensitive match
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', normalizedCode)
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        console.log('❌ Coupon not found or inactive:', code);
        return {
          valid: false,
          error: 'كوبون الخصم غير صحيح أو غير نشط'
        };
      }

      // Check start and expiration dates
      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return { valid: false, error: 'كوبون الخصم لم يبدأ بعد' };
      }
      if (coupon.ends_at && new Date(coupon.ends_at) < now) {
        return { valid: false, error: 'انتهت صلاحية كوبون الخصم' };
      }

      // Check usage limits
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, error: 'تم استخدام كوبون الخصم بالكامل' };
      }

      // Check minimum order total
      const minimumAmount = coupon.minimum_amount || 0;
      if (minimumAmount > 0 && orderTotal < minimumAmount) {
        return {
          valid: false,
          error: `الحد الأدنى للطلب ${minimumAmount} جنيه`
        };
      }

      // Calculate discount
      let discountAmount = 0;
      const kind = coupon.discount_kind?.toLowerCase();

      if (kind === 'percent' || kind === 'percentage') {
        discountAmount = (orderTotal * coupon.discount_value) / 100;
      } else if (kind === 'fixed') {
        discountAmount = coupon.discount_value;
      } else {
        console.warn('⚠️ Unknown discount kind, defaulting to percent');
        discountAmount = (orderTotal * coupon.discount_value) / 100;
      }

      // Apply maximum discount if defined
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }

      // Ensure discount doesn't exceed order total
      discountAmount = Math.min(discountAmount, orderTotal);

      console.log('✅ Coupon valid, discount amount:', discountAmount);

      return {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discount_kind: coupon.discount_kind,
          discount_value: coupon.discount_value,
          discount_amount: discountAmount
        }
      };

    } catch (error: any) {
      console.error('💥 Error validating coupon:', error);
      return {
        valid: false,
        error: 'حدث خطأ أثناء التحقق من كوبون الخصم'
      };
    }
  }

  // ✅ Apply coupon using Supabase RPC function
  static async applyCoupon(couponId: string, userId?: string) {
    try {
      console.log('🎯 Applying coupon:', couponId, 'for user:', userId);

      // Fetch coupon info first
      const { data: coupon, error: fetchError } = await supabase
        .from('coupons')
        .select('id, usage_limit_global, usage_limit_per_user, used_count')
        .eq('id', couponId)
        .single();

      if (fetchError || !coupon) {
        console.error('❌ Error fetching coupon for update:', fetchError);
        return { ok: false, message: 'لم يتم العثور على الكوبون' };
      }

      // ✅ Use the Supabase RPC function (atomic update)
      const { data, error } = await supabase.rpc('apply_coupon_atomic', {
        p_coupon_id: coupon.id,
        p_user_id: userId || null,
        p_usage_limit_global: coupon.usage_limit_global,
        p_usage_limit_per_user: coupon.usage_limit_per_user
      });

      if (error) {
        console.error('💥 Error applying coupon via RPC:', error);
        return { ok: false, message: 'فشل في تطبيق الكوبون' };
      }

      if (!data) {
        console.log('⚠️ Coupon limit reached.');
        return { ok: false, message: 'تم الوصول إلى الحد الأقصى لاستخدام الكوبون' };
      }

      console.log('✅ Coupon applied successfully:', data);
      return { ok: true, message: 'تم تطبيق الكوبون بنجاح', redemptionId: data };

    } catch (error) {
      console.error('💥 Error in applyCoupon:', error);
      return { ok: false, message: 'حدث خطأ أثناء تطبيق الكوبون' };
    }
  }
}
