
import { supabase } from '@/integrations/supabase/client';

export class CouponService {
  static async validateCoupon(code: string, orderTotal: number) {
    try {
      console.log('🎟️ Validating coupon:', code, 'for order total:', orderTotal);

      if (!code || code.trim().length === 0) {
        console.log('❌ Empty coupon code');
        return {
          valid: false,
          error: 'يرجى إدخال كود الكوبون'
        };
      }

      const normalizedCode = code.trim().toUpperCase();
      console.log('🔍 Searching for coupon with normalized code:', normalizedCode);

      // Fixed query: Use proper Supabase filtering
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .ilike('code', normalizedCode)
        .maybeSingle();

      if (error) {
        console.error('❌ Database error:', error);
        return {
          valid: false,
          error: 'حدث خطأ أثناء التحقق من الكوبون'
        };
      }

      if (!coupon) {
        console.log('❌ Coupon not found or inactive:', normalizedCode);
        return {
          valid: false,
          error: 'كوبون الخصم غير صحيح أو غير نشط'
        };
      }

      console.log('✅ Found coupon:', coupon);

      // Check expiration date
      if (coupon.expiration_date) {
        const expirationDate = new Date(coupon.expiration_date);
        const now = new Date();
        console.log('📅 Checking expiration:', {
          expiration: expirationDate.toISOString(),
          current: now.toISOString(),
          expired: expirationDate < now
        });
        
        if (expirationDate < now) {
          console.log('❌ Coupon expired:', normalizedCode);
          return {
            valid: false,
            error: 'انتهت صلاحية كوبون الخصم'
          };
        }
      }

      // Check usage limit - Fixed: Handle null values properly
      if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.usage_limit > 0) {
        const usedCount = coupon.used_count || 0;
        console.log('📊 Checking usage limit:', {
          used: usedCount,
          limit: coupon.usage_limit,
          exceeded: usedCount >= coupon.usage_limit
        });
        
        if (usedCount >= coupon.usage_limit) {
          console.log('❌ Coupon usage limit exceeded:', normalizedCode);
          return {
            valid: false,
            error: 'تم استخدام كوبون الخصم بالكامل'
          };
        }
      }

      // Check minimum amount - Fixed: Handle null values properly
      const minimumAmount = coupon.minimum_amount || 0;
      console.log('💰 Checking minimum amount:', {
        orderTotal,
        minimumRequired: minimumAmount,
        meetsRequirement: orderTotal >= minimumAmount
      });
      
      if (minimumAmount > 0 && orderTotal < minimumAmount) {
        console.log('❌ Order total below minimum:', orderTotal, 'required:', minimumAmount);
        return {
          valid: false,
          error: `الحد الأدنى للطلب ${minimumAmount} جنيه`
        };
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discount_type === 'percentage') {
        discountAmount = (orderTotal * coupon.discount_value) / 100;
      } else if (coupon.discount_type === 'fixed') {
        discountAmount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed order total
      discountAmount = Math.min(discountAmount, orderTotal);

      console.log('✅ Coupon validation successful:', {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount
      });

      return {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
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
      // First get the current used_count
      const { data: currentCoupon, error: fetchError } = await supabase
        .from('coupons')
        .select('used_count')
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
          used_count: (currentCoupon.used_count || 0) + 1,
          updated_at: new Date().toISOString()
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
