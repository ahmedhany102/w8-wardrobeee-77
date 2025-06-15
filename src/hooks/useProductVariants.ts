
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Represents a single variant option: size, price, stock, for a color.
export interface ProductColorVariantOption {
  id?: string;
  color_variant_id: string;
  size: string;
  price: number;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

// Represents a color-variant for a product, and it holds all available sizes/prices/stocks for this color.
export interface ProductColorVariant {
  id: string;
  product_id: string;
  color: string;
  image: string | null;
  created_at?: string;
  updated_at?: string;
  options?: ProductColorVariantOption[];
}

// Hook to handle fetching/editing all product color/sizes data.
export const useProductVariants = (productId: string) => {
  const [variants, setVariants] = useState<ProductColorVariant[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all color-variants with their options for a given product
  const fetchVariants = async () => {
    setLoading(true);
    // Get all color variants for the product
    const { data: colorVariants, error: err1 } = await supabase
      .from("product_color_variants")
      .select("*")
      .eq("product_id", productId);
    if (err1) {
      toast.error("Failed to load color variants: " + err1.message);
      setVariants([]);
      setLoading(false);
      return;
    }

    // Get all options for those color variants
    const ids = colorVariants.map((cv: any) => cv.id);
    let optionsList: ProductColorVariantOption[] = [];
    if (ids.length > 0) {
      const { data: optionRows, error: err2 } = await supabase
        .from("product_color_variant_options")
        .select("*")
        .in("color_variant_id", ids);
      if (err2) {
        toast.error("Failed to load variant options: " + err2.message);
        setVariants(colorVariants.map((c: any) => ({ ...c, options: [] })));
        setLoading(false);
        return;
      }
      optionsList = optionRows || [];
    }
    // Assign options to each color variant
    const finalVariants: ProductColorVariant[] = colorVariants.map((cv: any) => ({
      ...cv,
      options: optionsList.filter(opt => opt.color_variant_id === cv.id),
    }));

    setVariants(finalVariants);
    setLoading(false);
  };

  // Add a new color variant with options  
  const addVariant = async (variant: { color: string; image: string | null, options: Array<{ size: string; price: number; stock: number }> }) => {
    // First, insert the color variant
    const { data: colorVar, error: err1 } = await supabase
      .from("product_color_variants")
      .insert({ product_id: productId, color: variant.color, image: variant.image || null })
      .select("*")
      .single();
    if (err1 || !colorVar) {
      toast.error("Failed to add color variant: " + (err1?.message || "Unknown error"));
      return;
    }
    // Then, for each option, insert sizes/prices/stocks
    const optionsToInsert = (variant.options || []).map(opt => ({
      color_variant_id: colorVar.id,
      size: opt.size,
      price: opt.price,
      stock: opt.stock
    }));
    if (optionsToInsert.length) {
      const { error: err2 } = await supabase
        .from("product_color_variant_options")
        .insert(optionsToInsert);
      if (err2) {
        toast.error("Failed to add color options: " + err2.message);
      }
    }
    fetchVariants();
  };

  // Update a color or its image
  const updateVariant = async (id: string, update: Partial<Omit<ProductColorVariant, 'id' | 'product_id'>>) => {
    const { error } = await supabase
      .from("product_color_variants")
      .update(update)
      .eq("id", id);
    if (error) toast.error(error.message);
    fetchVariants();
  };

  // Update a specific size/price/stock for a color variant option
  const updateOption = async (optionId: string, patch: Partial<ProductColorVariantOption>) => {
    const { error } = await supabase
      .from("product_color_variant_options")
      .update(patch)
      .eq("id", optionId);
    if (error) toast.error(error.message);
    fetchVariants();
  };

  // Delete an entire color variant (removes all its options too via cascade)
  const deleteVariant = async (id: string) => {
    const { error } = await supabase
      .from("product_color_variants")
      .delete()
      .eq("id", id);
    if (error) toast.error(error.message);
    fetchVariants();
  };

  // Delete a specific size/option from a color variant
  const deleteOption = async (optionId: string) => {
    const { error } = await supabase
      .from("product_color_variant_options")
      .delete()
      .eq("id", optionId);
    if (error) toast.error(error.message);
    fetchVariants();
  };

  return {
    variants,
    loading,
    fetchVariants,
    addVariant,
    updateVariant,
    deleteVariant,
    updateOption,
    deleteOption,
  };
};
