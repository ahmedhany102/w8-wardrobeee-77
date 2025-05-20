
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, Facebook, Instagram, Twitter } from 'lucide-react';

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
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-gray-700 pb-2">W8 Store</h3>
            {contactSettings?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>{contactSettings.address}</span>
              </div>
            )}
            {contactSettings?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-500" />
                <a href={`tel:${contactSettings.phone}`} className="hover:text-green-400">
                  {contactSettings.phone}
                </a>
              </div>
            )}
            {contactSettings?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-500" />
                <a href={`mailto:${contactSettings.email}`} className="hover:text-green-400">
                  {contactSettings.email}
                </a>
              </div>
            )}
            {contactSettings?.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" />
                <a href={contactSettings.website} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                  {contactSettings.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-gray-700 pb-2">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-green-400">الرئيسية</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-green-400">المنتجات</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-green-400">سلة المشتريات</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-400">اتصل بنا</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-green-400">حسابي</Link>
              </li>
            </ul>
            
            {/* Social Media Links */}
            {(contactSettings?.facebook || contactSettings?.instagram || contactSettings?.twitter) && (
              <div className="mt-4">
                <h4 className="text-sm font-bold mb-2">تابعنا</h4>
                <div className="flex space-x-4">
                  {contactSettings?.facebook && (
                    <a href={contactSettings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {contactSettings?.instagram && (
                    <a href={contactSettings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {contactSettings?.twitter && (
                    <a href={contactSettings.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Developer Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-gray-700 pb-2">المطور</h3>
            <div className="space-y-2">
              <p>Ahmed Hany</p>
              <div className="flex space-x-4">
                <a href="https://github.com/ahmedhany-188" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/ahmed-hany-4042b2190/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="https://twitter.com/AhmedHa48277957" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5 0-.28-.03-.56-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                <a href="https://www.ahmedhany.me" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                  www.ahmedhany.me
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} W8 Store. جميع الحقوق محفوظة.</p>
          <p className="mt-1">تم التطوير بواسطة Ahmed Hany</p>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
