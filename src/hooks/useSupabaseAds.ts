
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Ad {
  id: string;
  title?: string;
  image_url: string;
  redirect_url?: string;
  description?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSupabaseAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching ads...');
      
      // Fetch ALL ads for admin (both active and inactive)
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching ads:', error);
        toast.error('Failed to load ads: ' + error.message);
        setAds([]);
        return;
      }
      
      console.log('✅ Ads fetched:', data?.length || 0, data);
      setAds(data || []);
      
    } catch (error: any) {
      console.error('💥 Exception while fetching ads:', error);
      toast.error('Failed to load ads: ' + error.message);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAds = async (): Promise<Ad[]> => {
    try {
      console.log('🔄 Fetching active ads for display...');
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching active ads:', error);
        return [];
      }
      
      console.log('✅ Active ads fetched:', data?.length || 0, data);
      return data || [];
      
    } catch (error: any) {
      console.error('💥 Exception while fetching active ads:', error);
      return [];
    }
  };

  return { 
    ads, 
    loading, 
    fetchActiveAds,
    refetch: fetchAds 
  };
};
