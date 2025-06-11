
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
      console.log('🔄 Fetching ads from Supabase...');
      
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
      
      console.log('✅ Ads fetched:', data?.length || 0);
      setAds(data || []);
      
    } catch (error: any) {
      console.error('💥 Exception while fetching ads:', error);
      toast.error('Failed to load ads: ' + error.message);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const addAd = async (adData: any) => {
    try {
      console.log('🆕 Adding ad to database:', adData);
      
      const cleanData = {
        title: adData.title?.trim() || '',
        image_url: adData.image_url?.trim() || '',
        redirect_url: adData.redirect_url?.trim() || '',
        description: adData.description?.trim() || '',
        position: Number(adData.position) || 0,
        is_active: Boolean(adData.is_active ?? true)
      };

      const { data, error } = await supabase
        .from('ads')
        .insert(cleanData)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Failed to add ad:', error);
        toast.error('Failed to add ad: ' + error.message);
        return null;
      }

      console.log('✅ Ad added successfully:', data);
      toast.success('Ad added successfully!');
      
      // Refresh the ads list
      await fetchAds();
      return data;
    } catch (error: any) {
      console.error('💥 Exception while adding ad:', error);
      toast.error('Failed to add ad: ' + error.message);
      return null;
    }
  };

  const updateAd = async (id: string, updates: any) => {
    try {
      console.log('✏️ Updating ad:', id, updates);
      
      const cleanUpdates: any = {};
      
      if (updates.title !== undefined) cleanUpdates.title = updates.title?.trim() || '';
      if (updates.image_url !== undefined) cleanUpdates.image_url = updates.image_url?.trim() || '';
      if (updates.redirect_url !== undefined) cleanUpdates.redirect_url = updates.redirect_url?.trim() || '';
      if (updates.description !== undefined) cleanUpdates.description = updates.description?.trim() || '';
      if (updates.position !== undefined) cleanUpdates.position = Number(updates.position) || 0;
      if (updates.is_active !== undefined) cleanUpdates.is_active = Boolean(updates.is_active);

      const { data, error } = await supabase
        .from('ads')
        .update(cleanUpdates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Failed to update ad:', error);
        toast.error('Failed to update ad: ' + error.message);
        return null;
      }

      console.log('✅ Ad updated successfully:', data);
      toast.success('Ad updated successfully!');
      
      // Refresh the ads list
      await fetchAds();
      return data;
    } catch (error: any) {
      console.error('💥 Exception while updating ad:', error);
      toast.error('Failed to update ad: ' + error.message);
      return null;
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
        console.error('❌ Failed to delete ad:', error);
        toast.error('Failed to delete ad: ' + error.message);
        return null;
      }

      console.log('✅ Ad deleted successfully');
      toast.success('Ad deleted successfully!');
      
      // Refresh the ads list
      await fetchAds();
      return true;
    } catch (error: any) {
      console.error('💥 Exception while deleting ad:', error);
      toast.error('Failed to delete ad: ' + error.message);
      return null;
    }
  };

  return { 
    ads, 
    loading, 
    addAd,
    updateAd,
    deleteAd,
    refetch: fetchAds 
  };
};
