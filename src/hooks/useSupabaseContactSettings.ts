
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSupabaseContactSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contact settings:', error);
        toast.error('Failed to load contact settings');
        return;
      }
      
      const settingsData = data && data.length > 0 ? data[0] : null;
      console.log('Fetched contact settings:', settingsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching contact settings:', error);
      toast.error('Failed to load contact settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates) => {
    try {
      console.log('Updating contact settings:', updates);
      let result;
      
      if (settings?.id) {
        const { data, error } = await supabase
          .from('contact_settings')
          .update({ 
            ...updates, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', settings.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating contact settings:', error);
          toast.error('Failed to update settings: ' + error.message);
          throw error;
        }
        result = data;
      } else {
        const { data, error } = await supabase
          .from('contact_settings')
          .insert([{ 
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating contact settings:', error);
          toast.error('Failed to create settings: ' + error.message);
          throw error;
        }
        result = data;
      }
      
      console.log('Contact settings updated successfully:', result);
      setSettings(result);
      toast.success('Settings updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating contact settings:', error);
      throw error;
    }
  };

  return { settings, loading, updateSettings, refetch: fetchSettings };
};
