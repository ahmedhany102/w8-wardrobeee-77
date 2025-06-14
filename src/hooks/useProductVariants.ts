
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductVariant {
  id?: string;
  product_id: string;
  color: string;
  size: string;
  image_url: string;
  price: number;
  stock: number;
}

export const useProductVariants = (productId: string) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVariants = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("product_variants")
      .select("*").eq("product_id", productId).order("color").order("size");
    if (error) {
      toast.error(error.message);
      setVariants([]);
    } else {
      setVariants(data || []);
    }
    setLoading(false);
  };

  const addVariant = async (variant: Omit<ProductVariant, "id">) => {
    const { error } = await supabase.from("product_variants").insert([variant]);
    if (error) toast.error(error.message); else fetchVariants();
  };
  const updateVariant = async (id: string, update: Partial<ProductVariant>) => {
    const { error } = await supabase.from("product_variants")
      .update(update).eq("id", id);
    if (error) toast.error(error.message); else fetchVariants();
  };
  const deleteVariant = async (id: string) => {
    const { error } = await supabase.from("product_variants").delete().eq("id", id);
    if (error) toast.error(error.message); else fetchVariants();
  };

  return { variants, loading, fetchVariants, addVariant, updateVariant, deleteVariant };
};
