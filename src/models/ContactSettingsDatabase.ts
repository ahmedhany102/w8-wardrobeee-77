
import { supabase } from '@/integrations/supabase/client';

export interface ContactSettings {
  id?: string;
  address: string;
  mapUrl: string;
  email: string;
  phone: string;
  workingHours: string;
  website: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  termsAndConditions: string;
  developerName: string;
  developerUrl: string;
  storeName?: string;
  updatedAt?: string;
}

class ContactSettingsDatabase {
  private static instance: ContactSettingsDatabase;

  private constructor() {}

  public static getInstance(): ContactSettingsDatabase {
    if (!ContactSettingsDatabase.instance) {
      ContactSettingsDatabase.instance = new ContactSettingsDatabase();
    }
    return ContactSettingsDatabase.instance;
  }

  public async getContactSettings(): Promise<ContactSettings> {
    try {
      // Always get the first record - we'll only have one settings record
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching contact settings:', error);
        return this.getDefaultSettings();
      }

      return data ? this.mapDatabaseToModel(data) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error in getContactSettings:', error);
      return this.getDefaultSettings();
    }
  }

  public async saveContactSettings(settings: ContactSettings): Promise<boolean> {
    try {
      // Ensure developer info is preserved
      const completeSettings = {
        ...settings,
        developerName: settings.developerName || 'Ahmed Hany',
        developerUrl: settings.developerUrl || 'https://ahmedhany.dev',
        updated_at: new Date().toISOString()
      };

      // Convert to snake_case for database
      const dbSettings = {
        id: completeSettings.id,
        address: completeSettings.address,
        map_url: completeSettings.mapUrl,
        email: completeSettings.email,
        phone: completeSettings.phone,
        working_hours: completeSettings.workingHours,
        website: completeSettings.website,
        facebook: completeSettings.facebook,
        instagram: completeSettings.instagram,
        twitter: completeSettings.twitter, 
        youtube: completeSettings.youtube,
        terms_and_conditions: completeSettings.termsAndConditions,
        developer_name: completeSettings.developerName,
        developer_url: completeSettings.developerUrl,
        store_name: completeSettings.storeName || 'W8 for Men',
        updated_at: completeSettings.updatedAt || new Date().toISOString()
      };

      let result;
      
      if (completeSettings.id) {
        // Update existing settings
        result = await supabase
          .from('contact_settings')
          .update(dbSettings)
          .eq('id', completeSettings.id);
      } else {
        // Create new settings
        result = await supabase
          .from('contact_settings')
          .insert(dbSettings)
          .select();
      }

      if (result.error) {
        console.error('Error saving contact settings:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveContactSettings:', error);
      return false;
    }
  }

  private getDefaultSettings(): ContactSettings {
    return {
      address: '',
      mapUrl: '',
      email: '',
      phone: '',
      workingHours: '',
      website: '',
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      termsAndConditions: '',
      developerName: 'Ahmed Hany',
      developerUrl: 'https://ahmedhany.dev',
      storeName: 'W8 for Men'
    };
  }

  private mapDatabaseToModel(dbData: any): ContactSettings {
    return {
      id: dbData.id,
      address: dbData.address || '',
      mapUrl: dbData.map_url || '',
      email: dbData.email || '',
      phone: dbData.phone || '',
      workingHours: dbData.working_hours || '',
      website: dbData.website || '',
      facebook: dbData.facebook || '',
      instagram: dbData.instagram || '',
      twitter: dbData.twitter || '',
      youtube: dbData.youtube || '',
      termsAndConditions: dbData.terms_and_conditions || '',
      developerName: dbData.developer_name || 'Ahmed Hany',
      developerUrl: dbData.developer_url || 'https://ahmedhany.dev',
      storeName: dbData.store_name || 'W8 for Men',
      updatedAt: dbData.updated_at
    };
  }
}

export default ContactSettingsDatabase;
