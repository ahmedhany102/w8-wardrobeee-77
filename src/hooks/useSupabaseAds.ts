
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
      console.log('🔄 Fetching promotional banners...');
      
      // FIXED: Using the direct Supabase client to avoid AdBlock issues
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching promotional banners:', error);
        toast.error('Failed to load promotional banners: ' + error.message);
        setAds([]);
        return;
      }
      
      console.log('✅ Promotional banners fetched:', data?.length || 0, data);
      setAds(data || []);
      
    } catch (error: any) {
      console.error('💥 Exception while fetching promotional banners:', error);
      toast.error('Failed to load promotional banners: ' + error.message);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAds = async (): Promise<Ad[]> => {
    try {
      console.log('🔄 Fetching active promotional banners for display...');
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching active promotional banners:', error);
        return [];
      }
      
      console.log('✅ Active promotional banners fetched:', data?.length || 0, data);
      return data || [];
      
    } catch (error: any) {
      console.error('💥 Exception while fetching active promotional banners:', error);
      return [];
    }
  };

  // FIXED: Using direct Supabase client to avoid AdBlock interference
  const deleteAd = async (id: string) => {
    try {
      console.log('🗑️ Deleting promotional banner:', id);
      
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error deleting promotional banner:', error);
        toast.error('Failed to delete promotional banner: ' + error.message);
        return false;
      }
      
      console.log('✅ Promotional banner deleted successfully');
      toast.success('Promotional banner deleted successfully!');
      
      // Refresh ads list
      await fetchAds();
      return true;
    } catch (error: any) {
      console.error('💥 Exception deleting promotional banner:', error);
      toast.error('Failed to delete promotional banner: ' + error.message);
      return false;
    }
  };

  // FIXED: Add file upload support alongside URL input
  const addAd = async (adData: Omit<Ad, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🆕 Adding promotional banner:', adData);
      
      const { data, error } = await supabase
        .from('ads')
        .insert([adData])
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Error adding promotional banner:', error);
        toast.error('Failed to add promotional banner: ' + error.message);
        return false;
      }
      
      console.log('✅ Promotional banner added successfully');
      toast.success('Promotional banner added successfully!');
      
      await fetchAds();
      return true;
    } catch (error: any) {
      console.error('💥 Exception adding promotional banner:', error);
      toast.error('Failed to add promotional banner: ' + error.message);
      return false;
    }
  };

  const updateAd = async (id: string, updates: Partial<Ad>) => {
    try {
      console.log('✏️ Updating promotional banner:', id, updates);
      
      const { data, error } = await supabase
        .from('ads')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Error updating promotional banner:', error);
        toast.error('Failed to update promotional banner: ' + error.message);
        return false;
      }
      
      console.log('✅ Promotional banner updated successfully');
      toast.success('Promotional banner updated successfully!');
      
      await fetchAds();
      return true;
    } catch (error: any) {
      console.error('💥 Exception updating promotional banner:', error);
      toast.error('Failed to update promotional banner: ' + error.message);
      return false;
    }
  };

  return { 
    ads, 
    loading, 
    fetchActiveAds,
    deleteAd,
    addAd,
    updateAd,
    refetch: fetchAds 
  };
};
