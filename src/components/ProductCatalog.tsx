import React, { useState } from 'react';
import SearchBar from './SearchBar';
import CategoryNavigation from './CategoryNavigation';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useProductFiltering } from '@/hooks/useProductFiltering';
import ProductCatalogHeader from './ProductCatalogHeader';
import ProductGrid from './ProductGrid';
import ShoppingCartDialog from './ShoppingCartDialog';
import { useCartIntegration } from '@/hooks/useCartIntegration';
import { useBulkProductVariants } from '@/hooks/useBulkProductVariants';
import BrowseModeToggle, { BrowseMode } from './BrowseModeToggle';
import VendorsGrid from './VendorsGrid';

const ProductCatalog: React.FC = () => {
  const [browseMode, setBrowseMode] = useState<BrowseMode>('products');
  const { products, loading } = useSupabaseProducts();
  const { cartItems, cartCount, addToCart: addToCartDB, removeFromCart, updateQuantity, clearCart } = useCartIntegration();
  const {
    filteredProducts,
    searchQuery,
    selectedCategoryId,
    handleSearch,
    handleCategoryFilter,
    clearFilters
  } = useProductFiltering(products);
  
  // Fetch all variants in bulk for all products
  const productIds = React.useMemo(() => products.map(p => p.id), [products]);
  const { variantsByProduct } = useBulkProductVariants(productIds);
  const [showCartDialog, setShowCartDialog] = React.useState(false);

  // Convert cart items to the format expected by ShoppingCartDialog
  const cartForDialog = cartItems.map(item => ({
    product: {
      id: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl
    },
    quantity: item.quantity
  }));

  const handleAddToCart = async (product: any, size: string, quantity?: number) => {
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : '';
    await addToCartDB(product, size, defaultColor, quantity || 1);
  };

  const handleUpdateCartItem = async (productId: string, newQuantity: number) => {
    const item = cartItems.find(item => item.productId === productId);
    if (item) {
      if (newQuantity <= 0) {
        await removeFromCart(item.id);
      } else {
        await updateQuantity(item.id, newQuantity);
      }
    }
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleProceedToCheckout = () => {
    setShowCartDialog(false);
    window.location.href = '/cart';
  };


  return (
    <div className="container mx-auto px-4 py-4 min-h-[1000px]">
      <ProductCatalogHeader
        cart={cartForDialog}
        onCartClick={() => setShowCartDialog(true)}
      />
      
      {/* Browse Mode Toggle */}
      <BrowseModeToggle mode={browseMode} onModeChange={setBrowseMode} />
      
      {browseMode === 'products' ? (
        <>
          <CategoryNavigation 
            onCategorySelect={handleCategoryFilter}
            selectedCategory={selectedCategoryId}
          />
          
          <SearchBar onSearch={handleSearch} placeholder="ابحث عن المنتجات..." />
          
          <ProductGrid 
            products={filteredProducts}
            loading={loading}
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
            onClearSearch={clearFilters}
            variantsByProduct={variantsByProduct}
          />
        </>
      ) : (
        <VendorsGrid />
      )}

      <ShoppingCartDialog
        isOpen={showCartDialog}
        onClose={setShowCartDialog}
        cart={cartForDialog}
        onUpdateCartItem={handleUpdateCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
};
export default ProductCatalog;
