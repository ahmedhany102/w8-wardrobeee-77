
import React from 'react';

const WorkingHours: React.FC = () => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Working Hours</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Monday - Friday:</span>
          <span>9:00 AM - 10:00 PM</span>
        </div>
        <div className="flex justify-between">
          <span>Saturday:</span>
          <span>10:00 AM - 8:00 PM</span>
        </div>
        <div className="flex justify-between">
          <span>Sunday:</span>
          <span>12:00 PM - 6:00 PM</span>
        </div>
      </div>
    </div>
  );
};

export default WorkingHours;
