
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, MessageCircleMore, Twitter, Youtube } from 'lucide-react';
import ContactSettingsDatabase, { ContactSettings } from '@/models/ContactSettingsDatabase';
import { supabase } from '@/integrations/supabase/client';

const CustomFooter = () => {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log("Loading footer settings...");
        // First try to get from Supabase directly
        const { data, error } = await supabase
          .from('contact_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching contact settings directly:', error);
          // Fallback to the database class
          const db = ContactSettingsDatabase.getInstance();
          const contactSettings = await db.getContactSettings();
          setSettings(contactSettings);
        } else if (data) {
          console.log("Footer settings loaded from Supabase:", data);
          // Map the snake_case fields to camelCase
          setSettings({
            id: data.id,
            address: data.address || '',
            mapUrl: data.map_url || '',
            email: data.email || '',
            phone: data.phone || '',
            workingHours: data.working_hours || '',
            website: data.website || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            twitter: data.twitter || '',
            youtube: data.youtube || '',
            termsAndConditions: data.terms_and_conditions || '',
            developerName: data.developer_name || 'Ahmed Hany',
            developerUrl: data.developer_url || 'https://ahmedhany.dev',
            storeName: data.store_name || 'W8 for Men',
          });
        } else {
          // No data found, use default settings
          setSettings({
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
          });
        }
      } catch (error) {
        console.error('Error loading contact settings for footer:', error);
        // Set default values if we can't load settings
        setSettings({
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
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const storeName = settings?.storeName || 'W8 for Men';
  const developerName = settings?.developerName || 'Ahmed Hany';
  const developerUrl = settings?.developerUrl || 'https://ahmedhany.dev';

  return (
    <footer className="mt-auto bg-gradient-to-r from-green-900 to-black text-white py-6 px-4 shadow-inner">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <h3 className="font-bold text-lg mb-2">{storeName}</h3>
            <p className="text-sm text-gray-300">Best collection for men</p>
            
            {!loading && settings && (
              <div className="mt-2 text-sm text-gray-300">
                {settings.address && (
                  <p className="mb-1">{settings.address}</p>
                )}
                {settings.phone && (
                  <p className="mb-1">Phone: {settings.phone}</p>
                )}
                {settings.email && (
                  <p className="mb-1">Email: {settings.email}</p>
                )}
                {settings.workingHours && (
                  <p className="mb-1">Hours: {settings.workingHours}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <nav className="flex flex-wrap justify-center gap-4 mb-4">
              <Link to="/" className="text-sm hover:text-green-300 transition-colors">Home</Link>
              <Link to="/profile" className="text-sm hover:text-green-300 transition-colors">My Account</Link>
              <Link to="/cart" className="text-sm hover:text-green-300 transition-colors">Cart</Link>
              <Link to="/orders" className="text-sm hover:text-green-300 transition-colors">My Orders</Link>
              <Link to="/contact" className="text-sm hover:text-green-300 transition-colors">Contact Us</Link>
              <Link to="/terms" className="text-sm hover:text-green-300 transition-colors">Terms & Conditions</Link>
            </nav>
            
            {!loading && settings && (
              <div className="flex space-x-4 mb-4">
                {settings.facebook && (
                  <a 
                    href={settings.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-300 hover:text-blue-400"
                  >
                    <Facebook size={20} />
                  </a>
                )}
                {settings.instagram && (
                  <a 
                    href={settings.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-300 hover:text-pink-400"
                  >
                    <Instagram size={20} />
                  </a>
                )}
                {settings.twitter && (
                  <a 
                    href={settings.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-300 hover:text-blue-400"
                  >
                    <Twitter size={20} />
                  </a>
                )}
                {settings.youtube && (
                  <a 
                    href={settings.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-300 hover:text-red-400"
                  >
                    <Youtube size={20} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-green-800 mt-4 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-xs text-gray-300 mb-3 md:mb-0">© {new Date().getFullYear()} {storeName}</p>
            
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-300">Dev {developerName}:</span>
              
              <a href="https://wa.me/qr/2O2JSVLBTNEIJ1" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400" title="WhatsApp">
                <MessageCircleMore size={16} />
              </a>
              
              <a href="https://www.facebook.com/share/16LEN8zQG3/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400" title="Facebook">
                <Facebook size={16} />
              </a>
              
              <a href="https://www.instagram.com/a7med._.hany/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-400" title="Instagram">
                <Instagram size={16} />
              </a>
              
              <a href="https://linkedin.com/in/ahmed-hany-436342257" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500" title="LinkedIn">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
