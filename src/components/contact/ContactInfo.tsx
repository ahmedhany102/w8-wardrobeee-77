
import React from 'react';
import { Card } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactInfo: React.FC = () => {
  return (
    <Card className="p-6 shadow-md bg-gradient-to-br from-green-700 to-green-900 text-white">
      <h2 className="text-xl font-semibold mb-6">Get In Touch</h2>
      
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-full mr-4">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/70">Call Us</p>
            <a href="tel:01501640040" className="text-lg font-semibold hover:text-green-300">
              01501640040
            </a>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-full mr-4">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/70">Email Us</p>
            <a href="mailto:support@w8.com" className="text-lg font-semibold hover:text-green-300">
              support@w8.com
            </a>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-full mr-4">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/70">Location</p>
            <p className="text-lg font-semibold">
              Cairo, Egypt
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContactInfo;
