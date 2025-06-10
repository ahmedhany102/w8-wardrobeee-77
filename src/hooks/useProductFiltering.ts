
import { useState, useMemo } from 'react';

export const useProductFiltering = (products: any[]) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (activeCategory !== 'ALL') {
      filtered = filtered.filter(product => {
        // Check both type and category fields for compatibility
        return product.type === activeCategory || product.category === activeCategory;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.type?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, activeCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchQuery(''); // Clear search when changing category
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
