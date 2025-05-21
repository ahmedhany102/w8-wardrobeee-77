
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-6 pb-3 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <h3 className="font-bold mb-2 text-base">ملابس أطفال وحريمي</h3>
            <p className="text-gray-300 mb-2">أفضل تشكيلة من الملابس والأحذية للأطفال والنساء بأسعار مناسبة وجودة عالية</p>
            <div className="flex space-x-3 rtl:space-x-reverse">
              <a href="#" className="text-white hover:text-blue-400">
                <Facebook size={16} />
              </a>
              <a href="#" className="text-white hover:text-pink-400">
                <Instagram size={16} />
              </a>
              <a href="#" className="text-white hover:text-blue-300">
                <Twitter size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-2 text-base">روابط سريعة</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">الرئيسية</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">اتصل بنا</Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-white">طلباتي</Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white">سلة التسوق</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-2 text-base">اتصل بنا</h3>
            <ul className="space-y-1">
              <li className="flex items-center">
                <Phone size={14} className="ml-2" />
                <span className="text-gray-300">+20 123 456 7890</span>
              </li>
              <li className="flex items-center">
                <Mail size={14} className="ml-2" />
                <span className="text-gray-300">info@w8store.com</span>
              </li>
              <li className="flex items-center">
                <MapPin size={14} className="ml-2" />
                <span className="text-gray-300">القاهرة، مصر</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-2 text-base">معلومات</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-white">سياسة الخصوصية</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white">الشروط والأحكام</Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white">سياسة الشحن</Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-gray-300 hover:text-white">سياسة الإرجاع</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between pt-4 mt-4 border-t border-gray-800 text-xs text-gray-400">
          <div>
            © {new Date().getFullYear()} ملابس أطفال وحريمي. جميع الحقوق محفوظة.
          </div>
          <div className="mt-1 md:mt-0">
            تم التطوير بواسطة <a href="#" className="text-blue-400 hover:underline">W8 Store</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
