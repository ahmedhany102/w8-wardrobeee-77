
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
}

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
};

const AdminContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('contact');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('contactSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('contactSettings', JSON.stringify(settings));
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="contact" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="contact">معلومات التواصل</TabsTrigger>
          <TabsTrigger value="terms">الشروط والأحكام</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معلومات التواصل الأساسية</CardTitle>
              <CardDescription>أدخل معلومات التواصل التي ستظهر للزوار</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="address" className="text-sm font-medium">العنوان</label>
                  <Input
                    id="address"
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    placeholder="العنوان الكامل"
                  />
                </div>
                
                <div>
                  <label htmlFor="mapUrl" className="text-sm font-medium">رابط الخريطة</label>
                  <Input
                    id="mapUrl"
                    name="mapUrl"
                    value={settings.mapUrl}
                    onChange={handleChange}
                    placeholder="رابط Google Maps"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleChange}
                    placeholder="البريد الإلكتروني للتواصل"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="text-sm font-medium">رقم الهاتف</label>
                  <Input
                    id="phone"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                    placeholder="رقم الهاتف للتواصل"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="workingHours" className="text-sm font-medium">ساعات العمل</label>
                <Input
                  id="workingHours"
                  name="workingHours"
                  value={settings.workingHours}
                  onChange={handleChange}
                  placeholder="مثال: من السبت إلى الخميس 9 صباحًا - 5 مساءً"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>روابط التواصل الاجتماعي</CardTitle>
              <CardDescription>أضف روابط حسابات التواصل الاجتماعي الخاصة بمتجرك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="text-sm font-medium">الموقع الإلكتروني</label>
                  <Input
                    id="website"
                    name="website"
                    value={settings.website}
                    onChange={handleChange}
                    placeholder="رابط الموقع الإلكتروني"
                  />
                </div>
                
                <div>
                  <label htmlFor="facebook" className="text-sm font-medium">فيسبوك</label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={settings.facebook}
                    onChange={handleChange}
                    placeholder="رابط صفحة الفيسبوك"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="instagram" className="text-sm font-medium">انستغرام</label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={settings.instagram}
                    onChange={handleChange}
                    placeholder="رابط حساب انستغرام"
                  />
                </div>
                
                <div>
                  <label htmlFor="twitter" className="text-sm font-medium">تويتر</label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={settings.twitter}
                    onChange={handleChange}
                    placeholder="رابط حساب تويتر"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="youtube" className="text-sm font-medium">يوتيوب</label>
                <Input
                  id="youtube"
                  name="youtube"
                  value={settings.youtube}
                  onChange={handleChange}
                  placeholder="رابط قناة اليوتيوب"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>الشروط والأحكام</CardTitle>
              <CardDescription>أدخل الشروط والأحكام الخاصة بالمتجر</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="termsAndConditions"
                name="termsAndConditions"
                value={settings.termsAndConditions}
                onChange={handleChange}
                placeholder="أدخل الشروط والأحكام هنا..."
                className="min-h-[300px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-end">
        <Button onClick={saveSettings} className="bg-green-600 hover:bg-green-700">
          حفظ التغييرات
        </Button>
      </CardFooter>
    </div>
  );
};

export default AdminContactSettings;
