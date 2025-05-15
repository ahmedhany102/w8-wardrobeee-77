
import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-gray-600 dark:text-gray-400 text-xs">© 2025 W8 Company</p>
          </div>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            <a 
              href="tel:01501640040" 
              className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors flex items-center"
              aria-label="Phone"
            >
              <span className="text-xs">01501640040</span>
            </a>
            <a 
              href="mailto:ahmedseifeldin97@gmail.com" 
              className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors flex items-center"
              aria-label="Email"
            >
              <Mail className="w-3 h-3" />
            </a>
            <a 
              href="https://www.instagram.com/_.w_8._/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-3 h-3" />
            </a>
            <a 
              href="https://www.linkedin.com/in/ahmed-hany-436342257/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
