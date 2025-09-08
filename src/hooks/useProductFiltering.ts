import { useState, useMemo } from 'react';

export const useProductFiltering = (products: any[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearFilters = () => {
    setSearchQuery('');
  };

  return {
    filteredProducts,
    searchQuery,
    handleSearch,
    clearFilters
  };
};
