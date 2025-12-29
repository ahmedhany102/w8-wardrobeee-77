-- Phase 1: Create vendors table (Stores) and link products

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index on owner_id (one vendor per user)
CREATE UNIQUE INDEX idx_vendors_owner_id ON public.vendors(owner_id);

-- Create index on slug for fast lookups
CREATE INDEX idx_vendors_slug ON public.vendors(slug);

-- Create index on status for filtering
CREATE INDEX idx_vendors_status ON public.vendors(status);

-- Add vendor_id to products table
ALTER TABLE public.products
ADD COLUMN vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL;

-- Create index on products.vendor_id
CREATE INDEX idx_products_vendor_id ON public.products(vendor_id);

-- Enable RLS on vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors table
-- Anyone can view active vendors
CREATE POLICY "Anyone can view active vendors"
ON public.vendors FOR SELECT
USING (status = 'active' OR owner_id = auth.uid() OR is_admin(auth.uid()));

-- Users can create their own vendor (one per user)
CREATE POLICY "Users can create their own vendor"
ON public.vendors FOR INSERT
WITH CHECK (owner_id = auth.uid() AND NOT EXISTS (
  SELECT 1 FROM public.vendors WHERE owner_id = auth.uid()
));

-- Vendors can update their own store
CREATE POLICY "Vendors can update their own store"
ON public.vendors FOR UPDATE
USING (owner_id = auth.uid() OR is_admin(auth.uid()))
WITH CHECK (owner_id = auth.uid() OR is_admin(auth.uid()));

-- Only admins can delete vendors
CREATE POLICY "Only admins can delete vendors"
ON public.vendors FOR DELETE
USING (is_admin(auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate URL-safe slug
CREATE OR REPLACE FUNCTION public.generate_vendor_slug(vendor_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug: lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(vendor_name, '[^\w\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.vendors WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Function to get vendor products
CREATE OR REPLACE FUNCTION public.get_vendor_products_by_slug(vendor_slug TEXT)
RETURNS SETOF products
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.* FROM public.products p
  JOIN public.vendors v ON v.id = p.vendor_id
  WHERE v.slug = vendor_slug
    AND v.status = 'active'
    AND (p.status IN ('active', 'approved') OR p.user_id = auth.uid() OR is_admin(auth.uid()))
  ORDER BY p.created_at DESC;
$$;

-- Function to get all active vendors
CREATE OR REPLACE FUNCTION public.get_active_vendors()
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  logo_url TEXT,
  cover_url TEXT,
  status TEXT,
  product_count BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    v.id,
    v.name,
    v.slug,
    v.logo_url,
    v.cover_url,
    v.status,
    COUNT(p.id) as product_count
  FROM public.vendors v
  LEFT JOIN public.products p ON p.vendor_id = v.id AND p.status IN ('active', 'approved')
  WHERE v.status = 'active'
  GROUP BY v.id, v.name, v.slug, v.logo_url, v.cover_url, v.status
  ORDER BY v.name;
$$;