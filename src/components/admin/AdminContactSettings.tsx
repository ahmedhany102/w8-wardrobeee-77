
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContactSettingsDatabase, { ContactSettings } from '@/models/ContactSettingsDatabase';

const defaultSettings: ContactSettings = {
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

const AdminContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('contact');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const db = ContactSettingsDatabase.getInstance();
      const savedSettings = await db.getContactSettings();
      if (savedSettings) {
        // Ensure developer information is preserved
        setSettings({
          ...savedSettings,
          developerName: savedSettings.developerName || defaultSettings.developerName,
          developerUrl: savedSettings.developerUrl || defaultSettings.developerUrl
        });
      }
    } catch (error) {
      console.error('Error loading contact settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Ensure developer info is always present
      const dataToSave = {
        ...settings,
        developerName: settings.developerName || defaultSettings.developerName,
        developerUrl: settings.developerUrl || defaultSettings.developerUrl,
        storeName: settings.storeName || 'W8 for Men'
      };
      
      const db = ContactSettingsDatabase.getInstance();
      const success = await db.saveContactSettings(dataToSave);
      
      if (success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="contact" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="contact">Contact Information</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="developer">Developer Credit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Enter basic store information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label htmlFor="storeName" className="text-sm font-medium">Store Name</label>
                <Input
                  id="storeName"
                  name="storeName"
                  value={settings.storeName || ''}
                  onChange={handleChange}
                  placeholder="Store Name"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Basic Contact Information</CardTitle>
              <CardDescription>Enter contact information to display for visitors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address" className="text-sm font-medium">Address</label>
                  <Input
                    id="address"
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    placeholder="Full Address"
                  />
                </div>
                
                <div>
                  <label htmlFor="mapUrl" className="text-sm font-medium">Map URL</label>
                  <Input
                    id="mapUrl"
                    name="mapUrl"
                    value={settings.mapUrl}
                    onChange={handleChange}
                    placeholder="Google Maps Link"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleChange}
                    placeholder="Contact Email"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                  <Input
                    id="phone"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                    placeholder="Contact Phone"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="workingHours" className="text-sm font-medium">Working Hours</label>
                <Input
                  id="workingHours"
                  name="workingHours"
                  value={settings.workingHours}
                  onChange={handleChange}
                  placeholder="Example: Monday-Friday 9AM-5PM"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Add social media links for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="text-sm font-medium">Website</label>
                  <Input
                    id="website"
                    name="website"
                    value={settings.website}
                    onChange={handleChange}
                    placeholder="Website URL"
                  />
                </div>
                
                <div>
                  <label htmlFor="facebook" className="text-sm font-medium">Facebook</label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={settings.facebook}
                    onChange={handleChange}
                    placeholder="Facebook Page URL"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="instagram" className="text-sm font-medium">Instagram</label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={settings.instagram}
                    onChange={handleChange}
                    placeholder="Instagram Account URL"
                  />
                </div>
                
                <div>
                  <label htmlFor="twitter" className="text-sm font-medium">Twitter</label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={settings.twitter}
                    onChange={handleChange}
                    placeholder="Twitter Account URL"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="youtube" className="text-sm font-medium">YouTube</label>
                <Input
                  id="youtube"
                  name="youtube"
                  value={settings.youtube}
                  onChange={handleChange}
                  placeholder="YouTube Channel URL"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
              <CardDescription>Enter the store terms and conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="termsAndConditions"
                name="termsAndConditions"
                value={settings.termsAndConditions}
                onChange={handleChange}
                placeholder="Enter terms and conditions here..."
                className="min-h-[300px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer">
          <Card>
            <CardHeader>
              <CardTitle>Developer Credit</CardTitle>
              <CardDescription>Developer information shown in the footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="developerName" className="text-sm font-medium">Developer Name</label>
                  <Input
                    id="developerName"
                    name="developerName"
                    value={settings.developerName}
                    onChange={handleChange}
                    placeholder="Developer Name"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">This field cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="developerUrl" className="text-sm font-medium">Developer URL</label>
                  <Input
                    id="developerUrl"
                    name="developerUrl"
                    value={settings.developerUrl}
                    onChange={handleChange}
                    placeholder="Developer Website URL"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">This field cannot be changed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-end">
        <Button 
          onClick={saveSettings} 
          className="bg-green-600 hover:bg-green-700"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </div>
  );
};

export default AdminContactSettings;
