import { useState, useMemo } from 'react';

export const useProductFiltering = (products: any[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategoryId) {
      filtered = filtered.filter(product => product.category_id === selectedCategoryId);
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
  }, [products, searchQuery, selectedCategoryId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(null);
  };

  return {
    filteredProducts,
    searchQuery,
    selectedCategoryId,
    handleSearch,
    handleCategoryFilter,
    clearFilters
  };
};