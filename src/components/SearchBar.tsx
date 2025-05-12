
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="flex items-center space-x-2 w-full max-w-sm mb-6 mx-auto"
    >
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="pl-10 pr-4 py-2 w-full border-green-300 focus:border-green-500 focus:ring-green-500"
        />
      </div>
      <Button 
        type="submit" 
        className="bg-green-800 hover:bg-green-700 text-white"
      >
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
