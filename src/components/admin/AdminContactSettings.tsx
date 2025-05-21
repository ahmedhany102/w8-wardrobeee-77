
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContactSettings {
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
  linkedin: string;
  whatsapp: string;
}

const defaultSettings: ContactSettings = {
  address: '',
  mapUrl: '',
  email: '',
  phone: '',
  workingHours: '',
  website: '',
  facebook: 'https://www.facebook.com/share/16LEN8zQG3/',
  instagram: 'https://www.instagram.com/a7med._.hany/',
  twitter: '',
  youtube: '',
  termsAndConditions: '',
  developerName: 'Ahmed Hany',
  developerUrl: 'https://ahmedhany.dev',
  linkedin: 'https://www.linkedin.com/in/ahmed-hany-436342257',
  whatsapp: 'https://wa.me/qr/2O2JSVLBTNEIJ1'
};

const AdminContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('contact');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('contactSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Ensure developer information is preserved
        setSettings({
          ...parsedSettings,
          developerName: parsedSettings.developerName || defaultSettings.developerName,
          developerUrl: parsedSettings.developerUrl || defaultSettings.developerUrl,
          facebook: parsedSettings.facebook || defaultSettings.facebook,
          instagram: parsedSettings.instagram || defaultSettings.instagram,
          linkedin: parsedSettings.linkedin || defaultSettings.linkedin,
          whatsapp: parsedSettings.whatsapp || defaultSettings.whatsapp
        });
      } catch (error) {
        console.error('Error loading contact settings:', error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = () => {
    // Ensure developer info is always present
    const dataToSave = {
      ...settings,
      developerName: settings.developerName || defaultSettings.developerName,
      developerUrl: settings.developerUrl || defaultSettings.developerUrl,
      facebook: settings.facebook || defaultSettings.facebook,
      instagram: settings.instagram || defaultSettings.instagram,
      linkedin: settings.linkedin || defaultSettings.linkedin,
      whatsapp: settings.whatsapp || defaultSettings.whatsapp
    };
    localStorage.setItem('contactSettings', JSON.stringify(dataToSave));
    toast.success('Settings saved successfully');
  };

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
                  />
                </div>
                
                <div>
                  <label htmlFor="developerUrl" className="text-sm font-medium">Developer URL</label>
                  <Input
                    id="developerUrl"
                    name="developerUrl"
                    value={settings.developerUrl}
                    onChange={handleChange}
                    placeholder="Developer Website URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="linkedin" className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={settings.linkedin}
                    onChange={handleChange}
                    placeholder="LinkedIn Profile URL"
                  />
                </div>
                
                <div>
                  <label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp Link</label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={settings.whatsapp}
                    onChange={handleChange}
                    placeholder="WhatsApp Contact Link"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-end">
        <Button onClick={saveSettings} className="bg-green-600 hover:bg-green-700">
          Save Changes
        </Button>
      </CardFooter>
    </div>
  );
};

export default AdminContactSettings;
