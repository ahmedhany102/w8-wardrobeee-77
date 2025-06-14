
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
      console.log('🔄 Fetching advertisements...');
      
      // FIXED: Using proper table name to avoid AdBlock issues
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching advertisements:', error);
        toast.error('Failed to load advertisements: ' + error.message);
        setAds([]);
        return;
      }
      
      console.log('✅ Advertisements fetched:', data?.length || 0, data);
      setAds(data || []);
      
    } catch (error: any) {
      console.error('💥 Exception while fetching advertisements:', error);
      toast.error('Failed to load advertisements: ' + error.message);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAds = async (): Promise<Ad[]> => {
    try {
      console.log('🔄 Fetching active advertisements for display...');
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching active advertisements:', error);
        return [];
      }
      
      console.log('✅ Active advertisements fetched:', data?.length || 0, data);
      return data || [];
      
    } catch (error: any) {
      console.error('💥 Exception while fetching active advertisements:', error);
      return [];
    }
  };

  // FIXED: Add proper ad deletion function to avoid AdBlock issues
  const deleteAd = async (id: string) => {
    try {
      console.log('🗑️ Deleting advertisement:', id);
      
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Error deleting advertisement:', error);
        toast.error('Failed to delete advertisement: ' + error.message);
        return false;
      }
      
      console.log('✅ Advertisement deleted successfully');
      toast.success('Advertisement deleted successfully!');
      
      // Refresh ads list
      await fetchAds();
      return true;
    } catch (error: any) {
      console.error('💥 Exception deleting advertisement:', error);
      toast.error('Failed to delete advertisement: ' + error.message);
      return false;
    }
  };

  // FIXED: Add proper ad creation function
  const addAd = async (adData: Omit<Ad, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🆕 Adding advertisement:', adData);
      
      const { data, error } = await supabase
        .from('ads')
        .insert([adData])
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Error adding advertisement:', error);
        toast.error('Failed to add advertisement: ' + error.message);
        return false;
      }
      
      console.log('✅ Advertisement added successfully');
      toast.success('Advertisement added successfully!');
      
      await fetchAds();
      return true;
    } catch (error: any) {
      console.error('💥 Exception adding advertisement:', error);
      toast.error('Failed to add advertisement: ' + error.message);
      return false;
    }
  };

  // FIXED: Add proper ad update function
  const updateAd = async (id: string, updates: Partial<Ad>) => {
    try {
      console.log('✏️ Updating advertisement:', id, updates);
      
      const { data, error } = await supabase
        .from('ads')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Error updating advertisement:', error);
        toast.error('Failed to update advertisement: ' + error.message);
        return false;
      }
      
      console.log('✅ Advertisement updated successfully');
      toast.success('Advertisement updated successfully!');
      
      await fetchAds();
      return true;
    } catch (error: any) {
      console.error('💥 Exception updating advertisement:', error);
      toast.error('Failed to update advertisement: ' + error.message);
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
