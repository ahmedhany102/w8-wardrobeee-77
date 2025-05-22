
import React from 'react';
import { Link } from 'react-router-dom';

const CustomFooter = () => {
  return (
    <footer className="mt-auto bg-gradient-to-r from-green-900 to-black text-white py-6 px-4 shadow-inner">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <h3 className="font-bold text-lg mb-2">W8 للملابس</h3>
            <p className="text-sm text-gray-300">منتجاتنا فقط للرجال والأطفال</p>
          </div>
          
          <div className="flex flex-col items-center">
            <nav className="flex flex-wrap justify-center gap-4 mb-4">
              <Link to="/" className="text-sm hover:text-green-300 transition-colors">الرئيسية</Link>
              <Link to="/profile" className="text-sm hover:text-green-300 transition-colors">حسابي</Link>
              <Link to="/cart" className="text-sm hover:text-green-300 transition-colors">العربة</Link>
              <Link to="/orders" className="text-sm hover:text-green-300 transition-colors">طلباتي</Link>
              <Link to="/contact" className="text-sm hover:text-green-300 transition-colors">اتصل بنا</Link>
              <Link to="/terms" className="text-sm hover:text-green-300 transition-colors">الشروط والأحكام</Link>
            </nav>
          </div>
        </div>
        
        <div className="border-t border-green-800 mt-4 pt-4 text-center">
          <p className="text-xs text-gray-300">© {new Date().getFullYear()} W8 لملابس الرجال والأطفال فقط - تطوير وتصميم <a href="https://ahmedhany.dev" target="_blank" rel="noopener noreferrer" className="text-green-300 hover:underline">أحمد هاني</a></p>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
