
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Map, Phone, Mail, Clock, Globe, Instagram, Facebook, Twitter, Youtube } from "lucide-react";

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
}

const AdminContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>({
    address: "",
    mapUrl: "",
    email: "",
    phone: "",
    workingHours: "",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing contact settings
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("contactSettings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Error loading contact settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      localStorage.setItem("contactSettings", JSON.stringify(settings));
      toast.success("تم حفظ إعدادات الاتصال بنجاح");
    } catch (error) {
      console.error("Error saving contact settings:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white">
        <CardTitle className="text-xl">إعدادات صفحة الاتصال بنا</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Map className="inline-block w-4 h-4 mr-1" />
                العنوان
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="عنوان المتجر الفعلي"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Globe className="inline-block w-4 h-4 mr-1" />
                رابط الخريطة
              </label>
              <input
                type="text"
                name="mapUrl"
                value={settings.mapUrl}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="رابط Google Maps"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Mail className="inline-block w-4 h-4 mr-1" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="example@store.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Phone className="inline-block w-4 h-4 mr-1" />
                رقم الهاتف
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="+201234567890"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Clock className="inline-block w-4 h-4 mr-1" />
                ساعات العمل
              </label>
              <input
                type="text"
                name="workingHours"
                value={settings.workingHours}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="من الإثنين إلى الجمعة: 9 صباحاً - 5 مساءً"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Globe className="inline-block w-4 h-4 mr-1" />
                الموقع الإلكتروني
              </label>
              <input
                type="text"
                name="website"
                value={settings.website}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="https://www.example.com"
              />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-4">روابط التواصل الاجتماعي</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Facebook className="inline-block w-4 h-4 mr-1" />
                فيسبوك
              </label>
              <input
                type="text"
                name="facebook"
                value={settings.facebook}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="رابط صفحة الفيسبوك"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Instagram className="inline-block w-4 h-4 mr-1" />
                انستغرام
              </label>
              <input
                type="text"
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="رابط حساب الانستغرام"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Twitter className="inline-block w-4 h-4 mr-1" />
                تويتر
              </label>
              <input
                type="text"
                name="twitter"
                value={settings.twitter}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="رابط حساب تويتر"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Youtube className="inline-block w-4 h-4 mr-1" />
                يوتيوب
              </label>
              <input
                type="text"
                name="youtube"
                value={settings.youtube}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="رابط قناة اليوتيوب"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-700 hover:bg-green-800 text-white"
            >
              {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminContactSettings;
