import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
}

interface ApplyCouponRequest {
  code: string;
  cart_items: CartItem[];
  subtotal: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      userId = data.user?.id || null;
    }

    const body: ApplyCouponRequest = await req.json();
    const { code, cart_items, subtotal } = body;

    console.log('🎟️ Applying coupon:', code, 'for user:', userId, 'subtotal:', subtotal);

    // Validate input
    if (!code || !cart_items || !subtotal) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Fetch coupon with case-insensitive matching
    const { data: coupon, error: couponError } = await supabaseClient
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .maybeSingle();

    if (couponError || !coupon) {
      console.log('❌ Coupon not found:', code);
      return new Response(
        JSON.stringify({ ok: false, message: 'كوبون الخصم غير صحيح أو غير نشط' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const now = new Date();
    
    // Check if coupon has started
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      console.log('❌ Coupon not started yet:', code);
      return new Response(
        JSON.stringify({ ok: false, message: 'كوبون الخصم لم يبدأ بعد' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if coupon has expired
    if (coupon.ends_at && new Date(coupon.ends_at) < now) {
      console.log('❌ Coupon expired:', code);
      return new Response(
        JSON.stringify({ ok: false, message: 'انتهت صلاحية كوبون الخصم' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check minimum order value
    if (coupon.minimum_amount && subtotal < coupon.minimum_amount) {
      console.log('❌ Order below minimum:', subtotal, 'required:', coupon.minimum_amount);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: `الحد الأدنى للطلب ${coupon.minimum_amount} جنيه` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Use atomic transaction to check and increment usage limits
    const { data: transactionResult, error: transactionError } = await supabaseClient.rpc('apply_coupon_atomic', {
      p_coupon_id: coupon.id,
      p_user_id: userId,
      p_usage_limit_global: coupon.usage_limit_global,
      p_usage_limit_per_user: coupon.usage_limit_per_user
    });

    if (transactionError) {
      console.error('❌ Transaction error:', transactionError);
      return new Response(
        JSON.stringify({ ok: false, message: 'حدث خطأ أثناء التحقق من كوبون الخصم' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!transactionResult) {
      console.log('❌ Coupon usage limit exceeded');
      return new Response(
        JSON.stringify({ ok: false, message: 'تم استخدام كوبون الخصم بالكامل أو لقد استخدمت هذا الكوبون بالفعل' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const redemptionId = transactionResult;

    // Calculate eligible subtotal (for now, assume all items are eligible)
    const eligibleSubtotal = subtotal;

    // Calculate discount
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
      couponId: coupon.id
    });

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'تم تطبيق كوبون الخصم بنجاح',
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discount_kind: coupon.discount_kind,
          discount_value: coupon.discount_value,
          redemption_id: redemptionId
        },
        discount,
        finalTotal
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('💥 Error applying coupon:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        message: 'حدث خطأ أثناء التحقق من كوبون الخصم' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});