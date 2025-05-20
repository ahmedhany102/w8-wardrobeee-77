
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ad {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
}

const AdCarousel = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Load ads from localStorage
  useEffect(() => {
    const loadAds = () => {
      try {
        const storedAds = localStorage.getItem('homeAds');
        if (storedAds) {
          setAds(JSON.parse(storedAds));
        } else {
          // Default ads if none found
          const defaultAds = [
            {
              id: 'ad-1',
              imageUrl: '/placeholder.svg',
              title: 'عروض جديدة',
              link: '#'
            },
            {
              id: 'ad-2',
              imageUrl: '/placeholder.svg',
              title: 'وصل حديثاً',
              link: '#'
            }
          ];
          setAds(defaultAds);
          localStorage.setItem('homeAds', JSON.stringify(defaultAds));
        }
      } catch (error) {
        console.error('Error loading ads:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAds();
    
    // Auto-rotate ads
    const interval = setInterval(() => {
      nextAd();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Go to next ad
  const nextAd = () => {
    if (ads.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }
  };
  
  // Go to previous ad
  const prevAd = () => {
    if (ads.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
    }
  };
  
  // If no ads or still loading, show placeholder
  if (loading) {
    return (
      <Card className="w-full overflow-hidden animate-pulse">
        <AspectRatio ratio={16/6} className="bg-gray-200" />
      </Card>
    );
  }
  
  if (ads.length === 0) {
    return null;
  }
  
  const currentAd = ads[currentIndex];
  
  const handleAdClick = () => {
    if (currentAd.link) {
      window.location.href = currentAd.link;
    }
  };
  
  return (
    <Card className="w-full overflow-hidden relative group cursor-pointer" onClick={handleAdClick}>
      <AspectRatio ratio={16/6} className="bg-gray-100">
        <img 
          src={currentAd.imageUrl} 
          alt={currentAd.title || 'Ad'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {currentAd.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <h3 className="text-lg font-bold">{currentAd.title}</h3>
          </div>
        )}
      </AspectRatio>
      
      {/* Navigation controls */}
      {ads.length > 1 && (
        <>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              prevAd();
            }}
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hidden group-hover:flex h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              nextAd();
            }}
            variant="outline"
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hidden group-hover:flex h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Dots indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {ads.map((_, index) => (
              <button 
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
              />
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default AdCarousel;
