
import React from 'react';
import SearchBar from './SearchBar';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useProductCatalogLogic } from '@/hooks/useProductCatalogLogic';
import ProductCatalogHeader from './ProductCatalogHeader';
import ProductCatalogTabs from './ProductCatalogTabs';
import ProductGrid from './ProductGrid';
import ShoppingCartDialog from './ShoppingCartDialog';

const ProductCatalog: React.FC = () => {
  const { products, loading } = useSupabaseProducts();
  const {
    filteredProducts,
    activeTab,
    cart,
    showCartDialog,
    setShowCartDialog,
    handleSearch,
    handleTabChange,
    handleAddToCart,
    handleUpdateCartItem,
    handleClearCart,
    handleProceedToCheckout,
    handleClearSearch
  } = useProductCatalogLogic(products);

  return (
    <div className="container mx-auto px-4 py-4">
      <ProductCatalogHeader 
        cart={cart}
        onCartClick={() => setShowCartDialog(true)}
      />
      
      <SearchBar onSearch={handleSearch} />
      
      <ProductCatalogTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      >
        <ProductGrid 
          products={filteredProducts}
          loading={loading}
          searchQuery=""
          onAddToCart={handleAddToCart}
          onClearSearch={handleClearSearch}
        />
      </ProductCatalogTabs>

      <ShoppingCartDialog
        isOpen={showCartDialog}
        onClose={setShowCartDialog}
        cart={cart}
        onUpdateCartItem={handleUpdateCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
};

export default ProductCatalog;
