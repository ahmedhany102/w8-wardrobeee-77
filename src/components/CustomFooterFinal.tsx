// src/components/CustomFooterFinal.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, MessageCircleMore } from 'lucide-react';

const CustomFooterFinal = () => {
  // Default settings
  const settings = {
    store_name: 'W8 for Men',
    developer_name: 'Ahmed Hany',
    developer_url: 'https://ahmedhany.dev',
    facebook: 'https://www.facebook.com/share/16LEN8zQG3/',
    instagram: 'https://www.instagram.com/a7med._.hany/',
    linkedin: 'https://linkedin.com/in/ahmed-hany-436342257',
    whatsapp: 'https://wa.me/qr/2O2JSVLBTNEIJ1'
  };

  return (
    <footer className="mt-auto bg-gray-900 text-white py-6 px-4 shadow-inner">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <h3 className="font-bold text-lg mb-2">{settings.store_name}</h3>
            <p className="text-sm text-gray-300">Best collection for men</p>
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
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-xs text-gray-300 mb-3 md:mb-0">
              © {new Date().getFullYear()} {settings.store_name}. All Rights Reserved.
            </p>

            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-300">Dev {settings.developer_name}:</span>

              <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-green-400" title="WhatsApp">
                <MessageCircleMore size={16} />
              </a>

              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400" title="Facebook">
                <Facebook size={16} />
              </a>

              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-400" title="Instagram">
                <Instagram size={16} />
              </a>

              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500" title="LinkedIn">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooterFinal;
