import React from 'react';
import SearchBar from './SearchBar';
import CategoryNavigation from './CategoryNavigation';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useProductFiltering } from '@/hooks/useProductFiltering';
import ProductCatalogHeader from './ProductCatalogHeader';
import ProductGrid from './ProductGrid';
import ShoppingCartDialog from './ShoppingCartDialog';
import { useCartIntegration } from '@/hooks/useCartIntegration';

const ProductCatalog: React.FC = () => {
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
    <div className="container mx-auto px-4 py-4">
      <ProductCatalogHeader 
        cart={cartForDialog}
        onCartClick={() => setShowCartDialog(true)}
      />
      
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
      />

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
