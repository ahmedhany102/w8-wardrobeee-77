
import React from 'react';

interface MapSectionProps {
  settings: any;
}

const MapSection: React.FC<MapSectionProps> = ({ settings }) => {
  const mapUrl = settings?.map_url;

  if (!mapUrl) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">Find Us on the Map</h2>
      <div className="h-80 bg-gray-200 rounded-lg overflow-hidden shadow-md">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Store Location"
        />
      </div>
    </div>
  );
};

export default MapSection;
