import React from 'react';
import { Flame, Star, Clock, Tag } from 'lucide-react';
import { Section } from '@/types/section';
import AdCarousel from '@/components/AdCarousel';
import CategoryGrid from './CategoryGrid';
import ProductCarousel from './ProductCarousel';
import { useBestSellers, useHotDeals, useLastViewed, useCategoryProducts, useSectionProducts } from '@/hooks/useSections';
import { useAuth } from '@/contexts/AuthContext';

interface SectionRendererProps {
  section: Section;
  vendorId?: string;
  onCategorySelect?: (categoryId: string | null) => void;
}

// Individual section type components
const HeroCarouselSection: React.FC = () => {
  return <AdCarousel />;
};

const CategoryGridSection: React.FC<{ config: Section['config']; onCategorySelect?: (categoryId: string | null) => void }> = ({ config, onCategorySelect }) => {
  return <CategoryGrid limit={config.limit || 10} onCategorySelect={onCategorySelect} />;
};

const BestSellerSection: React.FC<{ config: Section['config']; vendorId?: string }> = ({ config, vendorId }) => {
  const { products, loading } = useBestSellers(vendorId, config.limit || 12);
  
  return (
    <ProductCarousel
      title="الأكثر مبيعاً"
      products={products}
      loading={loading}
      variant="best_seller"
      icon={<Star className="w-5 h-5" fill="currentColor" />}
      showMoreLink="/products?filter=best_seller"
    />
  );
};

const HotDealsSection: React.FC<{ config: Section['config']; vendorId?: string }> = ({ config, vendorId }) => {
  const { products, loading } = useHotDeals(vendorId, config.limit || 12);
  
  return (
    <ProductCarousel
      title="عروض حصرية 🔥"
      products={products}
      loading={loading}
      variant="hot_deals"
      icon={<Flame className="w-5 h-5" />}
      showMoreLink="/products?filter=hot_deals"
    />
  );
};

const LastViewedSection: React.FC<{ config: Section['config'] }> = ({ config }) => {
  const { user } = useAuth();
  const { products, loading } = useLastViewed(config.limit || 10);
  
  // Don't show if not logged in or no products
  if (!user || (!loading && products.length === 0)) return null;
  
  return (
    <ProductCarousel
      title="شاهدت مؤخراً"
      products={products}
      loading={loading}
      icon={<Clock className="w-5 h-5" />}
    />
  );
};

const CategoryProductsSection: React.FC<{ config: Section['config']; vendorId?: string }> = ({ config, vendorId }) => {
  const { products, loading } = useCategoryProducts(config.category_id || '', vendorId, config.limit || 12);
  
  if (!config.category_id) return null;
  
  return (
    <ProductCarousel
      title="منتجات الفئة"
      products={products}
      loading={loading}
      icon={<Tag className="w-5 h-5" />}
      showMoreLink={`/category/${config.category_id}`}
    />
  );
};

const ManualSection: React.FC<{ section: Section }> = ({ section }) => {
  const { products, loading } = useSectionProducts(section.id, section.config.limit || 12);
  
  return (
    <ProductCarousel
      title={section.title}
      products={products}
      loading={loading}
    />
  );
};

// Main SectionRenderer component
const SectionRenderer: React.FC<SectionRendererProps> = ({ section, vendorId, onCategorySelect }) => {
  switch (section.type) {
    case 'hero_carousel':
      return <HeroCarouselSection />;
    
    case 'category_grid':
      return <CategoryGridSection config={section.config} onCategorySelect={onCategorySelect} />;
    
    case 'best_seller':
      return <BestSellerSection config={section.config} vendorId={vendorId} />;
    
    case 'hot_deals':
      return <HotDealsSection config={section.config} vendorId={vendorId} />;
    
    case 'last_viewed':
      return <LastViewedSection config={section.config} />;
    
    case 'category_products':
      return <CategoryProductsSection config={section.config} vendorId={vendorId} />;
    
    case 'manual':
      return <ManualSection section={section} />;
    
    default:
      return null;
  }
};

export default SectionRenderer;
