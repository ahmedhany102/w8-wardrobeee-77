
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

const Terms = () => {
  const [termsContent, setTermsContent] = useState('');

  useEffect(() => {
    // Load terms from localStorage
    try {
      const savedSettings = localStorage.getItem('contactSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setTermsContent(parsedSettings.termsAndConditions || '');
      }
    } catch (error) {
      console.error('Error loading terms:', error);
    }
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">الشروط والأحكام</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          {termsContent ? (
            <div className="prose max-w-none whitespace-pre-line">
              {termsContent}
            </div>
          ) : (
            <p className="text-gray-500 italic">لم يتم إضافة شروط وأحكام بعد.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
