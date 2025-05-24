
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, MessageCircleMore } from 'lucide-react';
import { useSupabaseContactSettings } from '@/hooks/useSupabaseData';

const Footer = () => {
  const { settings, loading } = useSupabaseContactSettings();

  // Default values with correct developer info
  const defaultSettings = {
    store_name: 'W8 for Men',
    address: 'Cairo, Egypt',
    email: 'info@w8store.com',
    phone: '+20 123 456 7890',
    working_hours: 'Mon-Fri: 9AM-6PM',
    facebook: 'https://www.facebook.com/share/16LEN8zQG3/',
    instagram: 'https://www.instagram.com/a7med._.hany/',
    developer_name: 'Ahmed Hany',
    developer_url: 'https://ahmedhany.dev'
  };

  const currentSettings = settings || defaultSettings;

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white pt-6 pb-3 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center p-4">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white pt-6 pb-3 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <h3 className="font-bold mb-2 text-base">{currentSettings.store_name}</h3>
            <p className="text-gray-300 mb-2">Best collection of clothing and footwear for men at affordable prices.</p>
            <div className="flex space-x-3 rtl:space-x-reverse">
              {currentSettings.facebook && (
                <a href={currentSettings.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
                  <Facebook size={16} />
                </a>
              )}
              {currentSettings.instagram && (
                <a href={currentSettings.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400">
                  <Instagram size={16} />
                </a>
              )}
            </div>
          </div>
          
          <div>
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
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-2 text-base">Contact Us</h3>
            <ul className="space-y-1">
              <li className="flex items-center">
                <span className="text-gray-300">{currentSettings.phone}</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-300">{currentSettings.email}</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-300">{currentSettings.address}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-2 text-base">Information</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-3 md:mb-0">
              © {new Date().getFullYear()} {currentSettings.store_name}. All Rights Reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span>Dev {currentSettings.developer_name}: </span>
              
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

export default Footer;
