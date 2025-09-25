-- Create atomic coupon application function to prevent race conditions
CREATE OR REPLACE FUNCTION public.apply_coupon_atomic(
  p_coupon_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_usage_limit_global integer DEFAULT NULL,
  p_usage_limit_per_user integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_global_count integer;
  current_user_count integer;
  redemption_id uuid;
BEGIN
  -- Lock the coupon row to prevent race conditions
  SELECT id FROM coupons WHERE id = p_coupon_id FOR UPDATE;
  
  -- Check global usage limit
  IF p_usage_limit_global IS NOT NULL THEN
    SELECT COUNT(*) INTO current_global_count
    FROM coupon_redemptions
    WHERE coupon_id = p_coupon_id;
    
    IF current_global_count >= p_usage_limit_global THEN
      RETURN NULL; -- Usage limit exceeded
    END IF;
  END IF;
  
  -- Check per-user usage limit (only if user is authenticated)
  IF p_user_id IS NOT NULL AND p_usage_limit_per_user IS NOT NULL THEN
    SELECT COUNT(*) INTO current_user_count
    FROM coupon_redemptions
    WHERE coupon_id = p_coupon_id AND user_id = p_user_id;
    
    IF current_user_count >= p_usage_limit_per_user THEN
      RETURN NULL; -- User usage limit exceeded
    END IF;
  END IF;
  
  -- Create redemption record atomically
  INSERT INTO coupon_redemptions (coupon_id, user_id)
  VALUES (p_coupon_id, p_user_id)
  RETURNING id INTO redemption_id;
  
  -- Update the used_count in coupons table for backward compatibility
  UPDATE coupons 
  SET used_count = used_count + 1, 
      updated_at = now()
  WHERE id = p_coupon_id;
  
  RETURN redemption_id;
END;
$$;