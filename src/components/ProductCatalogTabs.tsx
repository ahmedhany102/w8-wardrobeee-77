
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductCatalogTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const ProductCatalogTabs: React.FC<ProductCatalogTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  children 
}) => {
  return (
    <Tabs defaultValue="ALL" value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="flex justify-center overflow-x-auto pb-4">
        <TabsList className="mb-8 bg-gradient-to-r from-green-900 to-black flex justify-between space-x-8 px-4 w-auto">
          <TabsTrigger 
            value="ALL" 
            className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800 px-3 text-sm"
          >
            الكل
          </TabsTrigger>
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
};

export default ProductCatalogTabs;
