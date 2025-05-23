
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Footer: React.FC = () => {
  const { isAdmin } = useAuth();
  
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="mb-2">Email: info@egyptianguardians.com</p>
            <p className="mb-2">Phone: +20 123 456 7890</p>
            <p className="mb-2">Address: 123 Cairo St., Egypt</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-green-400 transition-colors">Home</Link></li>
              <li><Link to="/contact" className="hover:text-green-400 transition-colors">Contact</Link></li>
              <li><Link to="/terms" className="hover:text-green-400 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-gray-300">
              Egyptian Guardians provides high-quality clothing made in Egypt with premium materials.
            </p>
          </div>
        </div>
        
        {/* Developer section only visible in admin panel */}
        {isAdmin && (
          <div className="border-t border-gray-700 mt-6 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="mb-4 md:mb-0">Developed by Ahmed Hany</p>
              <div className="flex space-x-4">
                <a href="https://wa.me/+201145204843" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">WhatsApp</a>
                <a href="https://www.facebook.com/profile.php?id=100018096248106" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">Facebook</a>
                <a href="https://www.instagram.com/ahmedhany1205/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">Instagram</a>
                <a href="https://www.linkedin.com/in/ahmed-hany-seif-eldien/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center text-gray-400 text-sm mt-8">
          © {new Date().getFullYear()} Egyptian Guardians. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
