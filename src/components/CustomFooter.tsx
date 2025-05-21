
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

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

const CustomFooter: React.FC = () => {
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    // Load contact settings
    try {
      const savedSettings = localStorage.getItem("contactSettings");
      if (savedSettings) {
        setContactSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading contact settings:", error);
    }
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-3">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Store Information */}
          <div className="space-y-1">
            <h3 className="text-sm font-bold border-b border-gray-700 pb-1 mb-1">معلومات المتجر</h3>
            {contactSettings?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                <span className="text-xs">{contactSettings.address}</span>
              </div>
            )}
            {contactSettings?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-green-500" />
                <a href={`tel:${contactSettings.phone}`} className="text-xs hover:text-green-400">
                  {contactSettings.phone}
                </a>
              </div>
            )}
            {contactSettings?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-green-500" />
                <a href={`mailto:${contactSettings.email}`} className="text-xs hover:text-green-400">
                  {contactSettings.email}
                </a>
              </div>
            )}
            <div className="mt-1 pt-1 flex gap-3">
              {contactSettings?.facebook && (
                <a href={contactSettings.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400 transition">
                  <Facebook className="h-3 w-3" />
                </a>
              )}
              {contactSettings?.instagram && (
                <a href={contactSettings.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400 transition">
                  <Instagram className="h-3 w-3" />
                </a>
              )}
              {contactSettings?.twitter && (
                <a href={contactSettings.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400 transition">
                  <Twitter className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-right">
            <div className="mb-2">
              <Link to="/terms" className="text-xs hover:text-green-400">الشروط والأحكام</Link>
            </div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} W8 Store. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
