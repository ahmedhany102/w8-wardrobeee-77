import { supabase } from '@/integrations/supabase/client';

export class CouponService {
  static async validateCoupon(code: string, orderTotal: number) {
    try {
      console.log('🎟️ Validating coupon:', code, 'for order total:', orderTotal);

      const normalizedCode = code.toUpperCase().trim();

      // Query the coupon with case-insensitive matching
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', normalizedCode)
        .eq('active', true)
        .single();

      if (error || !coupon) {
        console.log('❌ Coupon not found or inactive:', code);
        return {
          valid: false,
          error: 'كوبون الخصم غير صحيح أو غير نشط'
        };
      }

      // Check expiration date
      if (coupon.expires_at) {
        const expirationDate = new Date(coupon.expires_at);
        const now = new Date();
        if (expirationDate < now) {
          console.log('❌ Coupon expired:', code);
          return {
            valid: false,
            error: 'انتهت صلاحية كوبون الخصم'
          };
        }
      }

      // Check usage limit
      if (coupon.max_uses && coupon.uses >= coupon.max_uses) {
        console.log('❌ Coupon usage limit exceeded:', code);
        return {
          valid: false,
          error: 'تم استخدام كوبون الخصم بالكامل'
        };
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discount_kind === 'percentage') {
        discountAmount = (orderTotal * coupon.discount_value) / 100;
      } else if (coupon.discount_kind === 'fixed') {
        discountAmount = coupon.discount_value;
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

  static async applyCoupon(couponId: string) {
    try {
      const { data: currentCoupon, error: fetchError } = await supabase
        .from('coupons')
        .select('uses')
        .eq('id', couponId)
        .single();

      if (fetchError || !currentCoupon) {
        console.error('❌ Error fetching coupon for update:', fetchError);
        return false;
      }

      // Increment usage count
      const { error } = await supabase
        .from('coupons')
        .update({ 
          uses: currentCoupon.uses + 1
        })
        .eq('id', couponId);

      if (error) {
        console.error('❌ Error applying coupon:', error);
        return false;
      }

      console.log('✅ Coupon applied successfully:', couponId);
      return true;
    } catch (error) {
      console.error('💥 Error in applyCoupon:', error);
      return false;
    }
  }
}
