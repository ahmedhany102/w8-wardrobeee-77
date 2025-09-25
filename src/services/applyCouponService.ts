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
      const { data, error } = await supabase.functions.invoke('apply-coupon', {
        body: {
          code,
          cart_items: cartItems,
          subtotal
        }
      });

      if (error) {
        console.error('❌ Error calling apply-coupon function:', error);
        return {
          ok: false,
          message: 'حدث خطأ أثناء التحقق من كوبون الخصم'
        };
      }

      return data as ApplyCouponResponse;
    } catch (error: any) {
      console.error('💥 Exception calling apply-coupon:', error);
      return {
        ok: false,
        message: 'حدث خطأ أثناء التحقق من كوبون الخصم'
      };
    }
  }

    // Remove the separate applyCoupon.recordRedemption call since it's now handled atomically
    // The redemption is already recorded in the database transaction
}