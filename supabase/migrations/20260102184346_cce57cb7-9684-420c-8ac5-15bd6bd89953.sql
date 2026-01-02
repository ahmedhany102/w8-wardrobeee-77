-- Update get_last_viewed_products to support vendor filtering
CREATE OR REPLACE FUNCTION public.get_last_viewed_products(
  _user_id UUID,
  _vendor_id UUID DEFAULT NULL,
  _limit INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price NUMERIC,
  discount NUMERIC,
  image_url TEXT,
  rating NUMERIC,
  vendor_name TEXT,
  vendor_slug TEXT,
  vendor_logo_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (p.id)
    p.id,
    p.name,
    p.price,
    p.discount,
    COALESCE(p.main_image, p.image_url) as image_url,
    p.rating,
    v.name as vendor_name,
    v.slug as vendor_slug,
    v.logo_url as vendor_logo_url
  FROM product_views pv
  JOIN products p ON p.id = pv.product_id
  LEFT JOIN vendors v ON v.id = p.vendor_id
  WHERE pv.user_id = _user_id
    AND p.status IN ('active', 'approved')
    AND (_vendor_id IS NULL OR p.vendor_id = _vendor_id)
  ORDER BY p.id, pv.viewed_at DESC
  LIMIT _limit;
END;
$$;