
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactSettings {
  id: string;
  store_name: string;
  address?: string;
  email?: string;
  phone?: string;
  working_hours?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  map_url?: string;
  terms_and_conditions?: string;
  developer_name: string;
  developer_url: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching contact settings from Supabase...');
      
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching contact settings:', error);
        toast.error('Failed to load contact settings: ' + error.message);
        return;
      }
      
      console.log('✅ Contact settings fetched:', data);
      setSettings(data);
      
    } catch (error: any) {
      console.error('💥 Exception while fetching contact settings:', error);
      toast.error('Failed to load contact settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: any) => {
    try {
      console.log('💾 Saving contact settings:', updates);
      
      const cleanData = {
        store_name: updates.store_name?.trim() || 'W8 for Men',
        address: updates.address?.trim() || '',
        email: updates.email?.trim() || '',
        phone: updates.phone?.trim() || '',
        working_hours: updates.working_hours?.trim() || '',
        website: updates.website?.trim() || '',
        facebook: updates.facebook?.trim() || '',
        instagram: updates.instagram?.trim() || '',
        twitter: updates.twitter?.trim() || '',
        youtube: updates.youtube?.trim() || '',
        map_url: updates.map_url?.trim() || '',
        terms_and_conditions: updates.terms_and_conditions?.trim() || '',
        developer_name: 'Ahmed Hany',
        developer_url: 'https://ahmedhany.dev'
      };
      
      let result;
      
      if (settings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('contact_settings')
          .update(cleanData)
          .eq('id', settings.id)
          .select('*')
          .single();
        
        if (error) {
          console.error('❌ Failed to update contact settings:', error);
          toast.error('Failed to update settings: ' + error.message);
          throw error;
        }
        
        result = data;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('contact_settings')
          .insert(cleanData)
          .select('*')
          .single();
        
        if (error) {
          console.error('❌ Failed to create contact settings:', error);
          toast.error('Failed to create settings: ' + error.message);
          throw error;
        }
        
        result = data;
      }
      
      console.log('✅ Contact settings saved successfully:', result);
      setSettings(result);
      toast.success('Settings saved successfully!');
      
      return result;
      
    } catch (error: any) {
      console.error('💥 Exception while saving contact settings:', error);
      throw error;
    }
  };

  return { 
    settings, 
    loading, 
    updateSettings, 
    refetch: fetchSettings 
  };
};
