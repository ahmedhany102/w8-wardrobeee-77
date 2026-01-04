import React from 'react';
import { useSections, useBestSellers, useHotDeals, useLastViewed } from '@/hooks/useSections';
import SectionRenderer from './SectionRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import AdCarousel from '@/components/AdCarousel';
import CategoryGrid from './CategoryGrid';
import MidPageAds from '@/components/MidPageAds';
import { ProductCarousel } from '@/components/sections';
import { Star, Flame, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Section } from '@/types/section';

interface DynamicSectionsProps {
  scope?: 'global' | 'vendor';
  vendorId?: string;
  onCategorySelect?: (categoryId: string | null) => void;
}

const DynamicSections: React.FC<DynamicSectionsProps> = ({
  scope = 'global',
  vendorId,
  onCategorySelect
}) => {
  const { user } = useAuth();
  const { sections, loading } = useSections(scope, vendorId);
  
  // Fallback data hooks for when no sections are configured
  const { products: bestSellers, loading: bestSellersLoading } = useBestSellers(vendorId, 12);
  const { products: hotDeals, loading: hotDealsLoading } = useHotDeals(vendorId, 12);
  const { products: lastViewed, loading: lastViewedLoading } = useLastViewed(vendorId, 10);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero skeleton */}
        <Skeleton className="h-48 md:h-64 lg:h-80 w-full rounded-lg" />
        
        {/* Categories skeleton */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="w-16 h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Product section skeleton */}
        <div>
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="min-w-[180px] h-64 rounded-lg flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no sections configured in DB, show default fallback sections
  if (sections.length === 0) {
    return (
      <div className="space-y-6">
        {/* 1. Hero Banner / Ad Carousel */}
        <section>
          <AdCarousel />
        </section>

        {/* 2. Categories Grid */}
        <section>
          <CategoryGrid limit={10} onCategorySelect={onCategorySelect} />
        </section>

        {/* 3. Best Sellers */}
        {bestSellers.length > 0 && (
          <section>
            <ProductCarousel
              title="Best Sellers"
              products={bestSellers}
              loading={bestSellersLoading}
              variant="best_seller"
              icon={<Star className="w-5 h-5" fill="currentColor" />}
              showMoreLink="/best-sellers"
            />
          </section>
        )}

        {/* 4. Mid-Page Ads */}
        <section>
          <MidPageAds className="my-4" />
        </section>

        {/* 5. Hot Deals */}
        {hotDeals.length > 0 && (
          <section>
            <ProductCarousel
              title="Hot Deals 🔥"
              products={hotDeals}
              loading={hotDealsLoading}
              variant="hot_deals"
              icon={<Flame className="w-5 h-5" />}
              showMoreLink="/hot-deals"
            />
          </section>
        )}

        {/* 6. Last Viewed (only for logged-in users) */}
        {user && lastViewed.length > 0 && (
          <section>
            <ProductCarousel
              title="Recently Viewed"
              products={lastViewed}
              loading={lastViewedLoading}
              icon={<Clock className="w-5 h-5" />}
            />
          </section>
        )}
      </div>
    );
  }

  // Render sections from database
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          vendorId={vendorId}
          onCategorySelect={onCategorySelect}
        />
      ))}
      
      {/* Always show Last Viewed for logged-in users if not in sections */}
      {user && lastViewed.length > 0 && !sections.some(s => s.type === 'last_viewed') && (
        <section>
          <ProductCarousel
            title="Recently Viewed"
            products={lastViewed}
            loading={lastViewedLoading}
            icon={<Clock className="w-5 h-5" />}
          />
        </section>
      )}
    </div>
  );
};

export default DynamicSections;
