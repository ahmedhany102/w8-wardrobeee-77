
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Ad {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  redirect_url?: string;
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
      console.log('🔄 Fetching ads from database...');

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        console.error('❌ Error fetching ads:', error);
        toast.error('Failed to load ads: ' + error.message);
        return;
      }

      console.log('✅ Ads loaded:', data?.length || 0);
      setAds(data || []);
    } catch (error: any) {
      console.error('💥 Exception while fetching ads:', error);
      toast.error('Failed to load ads: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addAd = async (adData: Omit<Ad, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🆕 Adding new ad:', adData);

      const { data, error } = await supabase
        .from('ads')
        .insert([{
          title: adData.title,
          description: adData.description,
          image_url: adData.image_url,
          redirect_url: adData.redirect_url,
          position: adData.position,
          is_active: adData.is_active
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding ad:', error);
        toast.error('Failed to add ad: ' + error.message);
        return false;
      }

      console.log('✅ Ad added successfully:', data);
      toast.success('Ad added successfully!');
      await fetchAds(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('💥 Exception while adding ad:', error);
      toast.error('Failed to add ad: ' + error.message);
      return false;
    }
  };

  const updateAd = async (id: string, updates: Partial<Omit<Ad, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      console.log('✏️ Updating ad:', id, updates);

      const { data, error } = await supabase
        .from('ads')
        .update({
          title: updates.title,
          description: updates.description,
          image_url: updates.image_url,
          redirect_url: updates.redirect_url,
          position: updates.position,
          is_active: updates.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating ad:', error);
        toast.error('Failed to update ad: ' + error.message);
        return false;
      }

      console.log('✅ Ad updated successfully:', data);
      toast.success('Ad updated successfully!');
      await fetchAds(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('💥 Exception while updating ad:', error);
      toast.error('Failed to update ad: ' + error.message);
      return false;
    }
  };

  const deleteAd = async (id: string) => {
    try {
      console.log('🗑️ Deleting ad:', id);

      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting ad:', error);
        toast.error('Failed to delete ad: ' + error.message);
        return false;
      }

      console.log('✅ Ad deleted successfully');
      toast.success('Ad deleted successfully!');
      await fetchAds(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('💥 Exception while deleting ad:', error);
      toast.error('Failed to delete ad: ' + error.message);
      return false;
    }
  };

  const refetch = fetchAds;

  return {
    ads,
    loading,
    addAd,
    updateAd,
    deleteAd,
    refetch
  };
};
