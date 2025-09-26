
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeCategories } from "./useRealtimeCategories";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  product_count?: number;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Enable realtime updates
  useRealtimeCategories();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error) setCategories(data || []);
    setLoading(false);
  };

  const mainCategories = categories.filter(c => !c.parent_id && c.is_active);
  const subcategories = (parentId: string) =>
    categories.filter(c => c.parent_id === parentId && c.is_active);

  return {
    categories,
    mainCategories,
    subcategories,
    loading,
    refetch: fetchCategories,
  };
};
