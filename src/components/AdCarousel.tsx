
import React, { useEffect, useState } from 'react';
import { useSupabaseAds } from '@/hooks/useSupabaseAds';
import { Card } from './ui/card';

interface Ad {
  id: string;
  title?: string;
  image_url: string;
  redirect_url?: string;
  description?: string;
  position: number;
  is_active: boolean;
}

const AdCarousel: React.FC = () => {
  const { fetchActiveAds } = useSupabaseAds();
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    loadActiveAds();
  }, []);

  const loadActiveAds = async () => {
    setLoading(true);
    const ads = await fetchActiveAds();
    setActiveAds(ads);
    setLoading(false);
  };

  // Auto-rotate ads every 5 seconds if multiple ads exist
  useEffect(() => {
    if (activeAds.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % activeAds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeAds.length]);

  const handleAdClick = (ad: Ad) => {
    if (ad.redirect_url) {
      window.open(ad.redirect_url, '_blank');
    }
  };

  // Don't render anything if no ads or still loading
  if (loading || activeAds.length === 0) {
    return null;
  }

  const currentAd = activeAds[currentAdIndex];

  return (
    <div className="w-full mb-6">
      <Card className="relative overflow-hidden rounded-lg shadow-lg bg-gradient-to-r from-green-50 to-green-100">
        <div 
          className={`relative h-48 md:h-64 lg:h-80 w-full ${currentAd.redirect_url ? 'cursor-pointer' : ''}`}
          onClick={() => handleAdClick(currentAd)}
        >
          <img 
            src={currentAd.image_url} 
            alt={currentAd.title || 'Advertisement'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load ad image:', currentAd.image_url);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          
          {/* Overlay with title and description */}
          {(currentAd.title || currentAd.description) && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
              <div className="p-4 md:p-6 text-white">
                {currentAd.title && (
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{currentAd.title}</h2>
                )}
                {currentAd.description && (
                  <p className="text-sm md:text-base opacity-90">{currentAd.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Pagination dots for multiple ads */}
          {activeAds.length > 1 && (
            <div className="absolute bottom-4 right-4 flex space-x-2">
              {activeAds.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentAdIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentAdIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdCarousel;
