
import React from 'react';
import { Card } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';

interface ContactInfoProps {
  settings: any;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ settings }) => {
  const phone = settings?.phone || '01501640040';
  const email = settings?.email || 'support@w8.com';
  const address = settings?.address || 'Cairo, Egypt';

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
            <a href={`tel:${phone}`} className="text-lg font-semibold hover:text-green-300">
              {phone}
            </a>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-full mr-4">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/70">Email Us</p>
            <a href={`mailto:${email}`} className="text-lg font-semibold hover:text-green-300">
              {email}
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
              {address}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContactInfo;
