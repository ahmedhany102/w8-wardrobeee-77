import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
}

interface ApplyCouponResponse {
  ok: boolean;
  message: string;
  coupon?: {
    id: string;
    code: string;
    discount_kind: string;
    discount_value: number;
  };
  discount?: number;
  finalTotal?: number;
}

export class ApplyCouponService {
  static async applyCoupon(
    code: string, 
    cartItems: CartItem[], 
    subtotal: number
  ): Promise<ApplyCouponResponse> {
    try {
      // First fetch coupon details
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', code.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (couponError || !coupon) {
        return {
          ok: false,
          message: 'كوبون الخصم غير صحيح أو غير نشط'
        };
      }

      const now = new Date();
      
      // Check if coupon has started
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        return {
          ok: false,
          message: 'كوبون الخصم لم يبدأ بعد'
        };
      }

      // Check if coupon has expired
      if (coupon.ends_at && new Date(coupon.ends_at) < now) {
        return {
          ok: false,
          message: 'انتهت صلاحية كوبون الخصم'
        };
      }

      // Check minimum order value
      if (coupon.minimum_amount && subtotal < coupon.minimum_amount) {
        return {
          ok: false,
          message: `الحد الأدنى للطلب ${coupon.minimum_amount} جنيه`
        };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Try to apply coupon atomically using RPC
      const { data: redemptionId, error: rpcError } = await supabase.rpc(
        'apply_coupon_atomic',
        {
          p_coupon_id: coupon.id,
          p_user_id: user?.id || null,
          p_usage_limit_global: coupon.usage_limit_global,
          p_usage_limit_per_user: coupon.usage_limit_per_user
        }
      );

      // If redemption failed (returned NULL), coupon limit exceeded
      if (!redemptionId) {
        return {
          ok: false,
          message: user?.id 
            ? 'لقد استخدمت هذا الكوبون بالفعل أو تم استخدامه بالكامل'
            : 'تم استخدام كوبون الخصم بالكامل'
        };
      }

      if (rpcError) {
        console.error('❌ Error applying coupon:', rpcError);
        
        // Handle specific RPC errors
        if (rpcError.message?.includes('Authentication required')) {
          return {
            ok: false,
            message: 'يجب تسجيل الدخول لاستخدام كوبون الخصم'
          };
        }
        
        return {
          ok: false,
          message: 'حدث خطأ أثناء تطبيق كوبون الخصم'
        };
      }

      // Calculate discount
      const eligibleSubtotal = subtotal;
      let discount = 0;

      if (coupon.discount_kind === 'percent') {
        discount = (eligibleSubtotal * coupon.discount_value) / 100;
        // Apply max_discount cap if set
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      } else if (coupon.discount_kind === 'fixed') {
        discount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed subtotal
      discount = Math.min(discount, subtotal);
      discount = Math.max(0, discount);

      const finalTotal = subtotal - discount;

      console.log('✅ Coupon applied successfully:', {
        code,
        discount,
        finalTotal,
        redemptionId
      });

      return {
        ok: true,
        message: 'تم تطبيق كوبون الخصم بنجاح',
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discount_kind: coupon.discount_kind,
          discount_value: coupon.discount_value
        },
        discount,
        finalTotal
      };
    } catch (error: any) {
      console.error('💥 Exception calling apply-coupon:', error);
      return {
        ok: false,
        message: 'حدث خطأ أثناء التحقق من كوبون الخصم'
      };
    }
  }

  static async recordRedemption(couponId: string, orderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('coupon_redemptions')
        .insert({
          coupon_id: couponId,
          order_id: orderId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        console.error('❌ Error recording coupon redemption:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('💥 Exception recording redemption:', error);
      return false;
    }
  }
}