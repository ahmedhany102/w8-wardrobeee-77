
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Phone } from 'lucide-react';

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
  address: 'Cairo, Egypt',
  mapUrl: '',
  email: 'info@w8store.com',
  phone: '+20 123 456 7890',
  workingHours: 'Mon-Fri: 9AM-6PM',
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

const Footer = () => {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('contactSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Ensure developer information is preserved
        const mergedSettings = {
          ...parsedSettings,
          developerName: parsedSettings.developerName || defaultSettings.developerName,
          developerUrl: parsedSettings.developerUrl || defaultSettings.developerUrl
        };
        setSettings(mergedSettings);
      } catch (error) {
        console.error('Error parsing contact settings:', error);
      }
    }
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap md:flex-nowrap gap-4 text-sm">
          {/* First column - About */}
          <div className="w-full md:w-1/3">
            <h3 className="font-bold mb-2 text-base">W8 for Men</h3>
            <p className="text-gray-300 mb-2">Best collection of clothing and footwear for men at affordable prices.</p>
            <div className="flex space-x-2 rtl:space-x-reverse">
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
                  <Facebook size={16} />
                </a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400">
                  <Instagram size={16} />
                </a>
              )}
              {settings.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-300">
                  <Linkedin size={16} />
                </a>
              )}
            </div>
          </div>
          
          {/* Second column - Quick Links */}
          <div className="w-full md:w-1/3">
            <h3 className="font-bold mb-2 text-base">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">Contact Us</Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-white">My Orders</Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link>
              </li>
            </ul>
          </div>
          
          {/* Third column - Contact & Developer Info */}
          <div className="w-full md:w-1/3">
            <h3 className="font-bold mb-2 text-base">Contact</h3>
            <ul className="space-y-1">
              <li className="flex items-center">
                <Phone size={14} className="mr-2" />
                <span className="text-gray-300">{settings.phone}</span>
              </li>
              <li className="mt-3">
                <h3 className="font-bold text-sm mb-1">Developer</h3>
                <p className="text-gray-300">Dev Ahmed Hany</p>
                <div className="flex space-x-2 mt-1">
                  {settings.facebook && (
                    <a href="https://www.facebook.com/share/16LEN8zQG3/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
                      <Facebook size={14} />
                    </a>
                  )}
                  {settings.instagram && (
                    <a href="https://www.instagram.com/a7med._.hany/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400">
                      <Instagram size={14} />
                    </a>
                  )}
                  {settings.linkedin && (
                    <a href="https://linkedin.com/in/ahmed-hany-436342257" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-300">
                      <Linkedin size={14} />
                    </a>
                  )}
                  {settings.whatsapp && (
                    <a href="https://wa.me/qr/2O2JSVLBTNEIJ1" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-400">
                      WhatsApp
                    </a>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between pt-3 mt-3 border-t border-gray-800 text-xs text-gray-400">
          <div>
            © {new Date().getFullYear()} W8 Store for Men. All Rights Reserved.
          </div>
          <div className="mt-1 md:mt-0">
            Developed by <a href={settings.developerUrl || settings.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{settings.developerName}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
