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
  
  // Fallback data hooks - always loaded for potential use
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

  // Check which section types are configured in DB
  const hasHeroSection = sections.some(s => s.type === 'hero_carousel');
  const hasCategorySection = sections.some(s => s.type === 'category_grid');
  const hasMidPageAds = sections.some(s => s.type === 'mid_page_ads');
  const hasBestSellers = sections.some(s => s.type === 'best_seller');
  const hasHotDeals = sections.some(s => s.type === 'hot_deals');
  const hasLastViewed = sections.some(s => s.type === 'last_viewed');

  // Filter sections to show in the dynamic area (excluding the ones we render separately)
  const dynamicSections = sections.filter(s => 
    !['hero_carousel', 'category_grid'].includes(s.type)
  );

  return (
    <div className="space-y-6">
      {/* 1. ALWAYS render Hero Banner if not explicitly added as section */}
      {!hasHeroSection && (
        <section>
          <AdCarousel />
        </section>
      )}
      
      {/* Render hero_carousel section if configured */}
      {hasHeroSection && sections.filter(s => s.type === 'hero_carousel').map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          vendorId={vendorId}
          onCategorySelect={onCategorySelect}
        />
      ))}

      {/* 2. ALWAYS render Categories Grid if not explicitly added as section */}
      {!hasCategorySection && (
        <section>
          <CategoryGrid limit={10} onCategorySelect={onCategorySelect} />
        </section>
      )}
      
      {/* Render category_grid section if configured */}
      {hasCategorySection && sections.filter(s => s.type === 'category_grid').map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          vendorId={vendorId}
          onCategorySelect={onCategorySelect}
        />
      ))}

      {/* 3. Render dynamic sections in order (excluding hero and categories) */}
      {dynamicSections.map((section, index) => {
        // Insert mid-page ads after 2nd section if not explicitly configured
        const shouldInsertAds = !hasMidPageAds && index === 1;
        
        return (
          <React.Fragment key={section.id}>
            <SectionRenderer
              section={section}
              vendorId={vendorId}
              onCategorySelect={onCategorySelect}
            />
            {shouldInsertAds && (
              <section>
                <MidPageAds className="my-4" />
              </section>
            )}
          </React.Fragment>
        );
      })}

      {/* 4. Show fallback sections if not configured in DB */}
      {!hasBestSellers && bestSellers.length > 0 && dynamicSections.length === 0 && (
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

      {/* Mid-page ads fallback (if no sections at all) */}
      {dynamicSections.length === 0 && !hasMidPageAds && (
        <section>
          <MidPageAds className="my-4" />
        </section>
      )}

      {!hasHotDeals && hotDeals.length > 0 && dynamicSections.length === 0 && (
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

      {/* 5. Always show Last Viewed for logged-in users */}
      {user && !hasLastViewed && lastViewed.length > 0 && (
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