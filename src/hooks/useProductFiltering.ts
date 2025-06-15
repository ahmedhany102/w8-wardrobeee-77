import { useState, useMemo } from 'react';

export const useProductFiltering = (products: any[]) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category ID
    if (activeCategory && activeCategory !== 'ALL') {
      filtered = filtered.filter(product => {
        // Accept both `category_id` (UUID) and product.category_id
        return String(product.category_id) === String(activeCategory);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, activeCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearFilters = () => {
    setActiveCategory('ALL');
    setSearchQuery('');
  };

  return {
    filteredProducts,
    activeCategory,
    searchQuery,
    handleCategoryChange,
    handleSearch,
    clearFilters
  };
};
