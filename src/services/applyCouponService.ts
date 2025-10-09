import { supabase } from '@/integrations/supabase/client';

export async function applyCouponService(couponId: string, userId: string | null = null) {
  try {
    console.log('🎟 Applying coupon:', couponId, 'for user:', userId);

    // ✅ احضر بيانات الكوبون من الداتا بيز
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('id, usage_limit_global, usage_limit_per_user')
      .eq('id', couponId)
      .single();

    if (couponError || !coupon) {
      console.error('❌ Coupon not found or error fetching:', couponError);
      return { ok: false, message: 'لم يتم العثور على الكوبون أو حدث خطأ في جلب البيانات' };
    }

    // ✅ استدعاء الـ RPC Function بالطريقة الصحيحة
    const { data, error } = await supabase.rpc('apply_coupon_atomic', {
      p_coupon_id: coupon.id,
      p_user_id: userId,
      p_usage_limit_global: coupon.usage_limit_global,
      p_usage_limit_per_user: coupon.usage_limit_per_user
    });

    if (error) {
      console.error('💥 Error applying coupon:', error);
      return { ok: false, message: 'حدث خطأ أثناء تطبيق كوبون الخصم' };
    }

    if (!data) {
      return { ok: false, message: 'تم الوصول إلى الحد الأقصى لاستخدام الكوبون' };
    }

    console.log('✅ Coupon applied successfully, redemption ID:', data);
    return { ok: true, message: 'تم تطبيق الكوبون بنجاح', redemptionId: data };

  } catch (error) {
    console.error('💥 Fatal error in applyCouponService:', error);
    return { ok: false, message: 'حدث خطأ أثناء تنفيذ العملية' };
  }
}
