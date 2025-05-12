
import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 px-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-3 md:mb-0 flex flex-col items-center md:items-start">
            <p className="text-gray-600 dark:text-gray-400 text-sm">© 2025 All rights reserved. W8 Company</p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Dev By Ahmed Hany</p>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="mailto:ahmedseifeldin97@gmail.com" 
              className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors flex items-center"
              aria-label="Email"
            >
              <Mail className="w-4 h-4 mr-1" />
              <span className="text-xs">Contact</span>
            </a>
            <a 
              href="https://www.instagram.com/_.w_8._/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://www.linkedin.com/in/ahmed-hany-436342257/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
