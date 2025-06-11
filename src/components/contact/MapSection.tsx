
import React from 'react';

const MapSection: React.FC = () => {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">Find Us on the Map</h2>
      <div className="h-80 bg-gray-200 rounded-lg overflow-hidden shadow-md">
        {/* Replace with actual Google Maps embed if desired */}
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <p className="text-gray-600">Google Maps Embed Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
