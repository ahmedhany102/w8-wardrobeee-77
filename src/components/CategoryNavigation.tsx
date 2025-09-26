import React from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';

interface CategoryNavigationProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string | null;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({ 
  onCategorySelect, 
  selectedCategory 
}) => {
  const { mainCategories, loading } = useCategories();
  const navigate = useNavigate();

  const handleCategoryClick = (category: any) => {
    if (onCategorySelect) {
      onCategorySelect(category.id);
    } else {
      navigate(`/category/${category.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">تصفح حسب الفئة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (mainCategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">تصفح حسب الفئة</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* All Products Option */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
            !selectedCategory ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleCategoryClick({ id: null, slug: 'all', name: 'جميع المنتجات' })}
        >
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium text-sm truncate">جميع المنتجات</h4>
          </CardContent>
        </Card>

        {/* Category Cards */}
        {mainCategories.map((category) => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
              selectedCategory === category.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                {category.image_url ? (
                  <img 
                    src={category.image_url} 
                    alt={category.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="h-6 w-6 text-primary" />
                )}
              </div>
              <h4 className="font-medium text-sm truncate mb-1">{category.name}</h4>
              {category.product_count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {category.product_count} منتج
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoryNavigation;