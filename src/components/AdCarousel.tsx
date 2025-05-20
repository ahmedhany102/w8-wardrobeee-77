
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ad {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
  placement?: string;
  active?: boolean;
  order?: number;
}

const AdCarousel = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  
  const autoplayIntervalRef = useRef<number | null>(null);
  
  // Load ads from localStorage
  useEffect(() => {
    const loadAds = () => {
      try {
        const storedAds = localStorage.getItem('homeAds');
        if (storedAds) {
          // Get only active ads for the homepage
          const allAds = JSON.parse(storedAds);
          const homeAds = allAds
            .filter((ad: Ad) => ad.active !== false && (!ad.placement || ad.placement === 'home'))
            .sort((a: Ad, b: Ad) => (a.order || 0) - (b.order || 0));
            
          setAds(homeAds);
          
          if (homeAds.length === 0) {
            setDefaultAds();
          }
        } else {
          setDefaultAds();
        }
      } catch (error) {
        console.error('Error loading ads:', error);
        setDefaultAds();
      } finally {
        setLoading(false);
      }
    };
    
    const setDefaultAds = () => {
      // Default ads if none found
      const defaultAds = [
        {
          id: 'ad-1',
          imageUrl: '/placeholder.svg',
          title: 'عروض جديدة',
          link: '#',
          active: true,
          placement: 'home'
        },
        {
          id: 'ad-2',
          imageUrl: '/placeholder.svg',
          title: 'وصل حديثاً',
          link: '#',
          active: true,
          placement: 'home'
        }
      ];
      setAds(defaultAds);
      try {
        localStorage.setItem('homeAds', JSON.stringify(defaultAds));
      } catch (err) {
        console.error('Error setting default ads:', err);
      }
    };
    
    loadAds();
    
    // Listen for ads updates
    const handleAdsUpdate = () => {
      loadAds();
    };
    
    window.addEventListener('adsUpdated', handleAdsUpdate);
    
    // Start autoplay
    startAutoplay();
    
    return () => {
      window.removeEventListener('adsUpdated', handleAdsUpdate);
      // Clear autoplay on unmount
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, []);
  
  // Start autoplay with interval
  const startAutoplay = () => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }
    
    // Set interval for auto-rotation (5 seconds)
    autoplayIntervalRef.current = window.setInterval(() => {
      nextAd();
    }, 5000);
  };
  
  // Pause autoplay
  const pauseAutoplay = () => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  };
  
  // Resume autoplay
  const resumeAutoplay = () => {
    if (!autoplayIntervalRef.current) {
      startAutoplay();
    }
  };
  
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
  
  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    pauseAutoplay();
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      nextAd();
    } else if (touchEnd - touchStart > 50) {
      // Swipe right
      prevAd();
    }
    
    resumeAutoplay();
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
    <Card 
      className="w-full overflow-hidden relative group cursor-pointer"
      onClick={handleAdClick}
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AspectRatio ratio={16/6} className="bg-gray-100">
        <img 
          src={currentAd.imageUrl} 
          alt={currentAd.title || 'Advertisement'} 
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
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 w-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-4' : 'bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default AdCarousel;
