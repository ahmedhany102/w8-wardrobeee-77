
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-2 md:mb-0">
            <p className="text-sm">&copy; {new Date().getFullYear()} W8. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
            <Link to="/contact" className="text-gray-300 hover:text-white transition">
              Contact Us
            </Link>
            <Link to="/offers" className="text-gray-300 hover:text-white transition">
              Offers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
