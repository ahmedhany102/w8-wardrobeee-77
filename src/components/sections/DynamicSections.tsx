import React from 'react';
import { useSections } from '@/hooks/useSections';
import SectionRenderer from './SectionRenderer';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { sections, loading } = useSections(scope, vendorId);

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

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          vendorId={vendorId}
          onCategorySelect={onCategorySelect}
        />
      ))}
    </div>
  );
};

export default DynamicSections;
