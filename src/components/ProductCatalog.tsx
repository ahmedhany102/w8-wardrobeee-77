import React from 'react';
import SearchBar from './SearchBar';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useProductFiltering } from '@/hooks/useProductFiltering';
import ProductCatalogHeader from './ProductCatalogHeader';
import ProductCatalogTabs from './ProductCatalogTabs';
import ProductGrid from './ProductGrid';
import ShoppingCartDialog from './ShoppingCartDialog';
import { useCartIntegration } from '@/hooks/useCartIntegration';
import { useCategories } from "@/hooks/useCategories";

const ProductCatalog: React.FC = () => {
  const { products, loading } = useSupabaseProducts();
  const { mainCategories, subcategories } = useCategories();
  const { cartItems, cartCount, addToCart: addToCartDB, removeFromCart, updateQuantity, clearCart } = useCartIntegration();
  const {
    filteredProducts: searchFilteredProducts,
    activeCategory,
    searchQuery,
    handleCategoryChange,
    handleSearch,
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
    // Navigate to checkout page or implement checkout logic
    window.location.href = '/cart';
  };

  // Filtered menus: Only show Men + Men subs for now
  const menCat = mainCategories.find(c => c.slug === "men");
  const menSubs = menCat ? subcategories(menCat.id) : [];
  const [activeSubcat, setActiveSubcat] = React.useState<string>("ALL");

  const filteredProducts = React.useMemo(() => {
    if (activeSubcat === "ALL") return products;
    // Filter by selected subcategory
    return products.filter(p => p.category_id === activeSubcat);
  }, [products, activeSubcat]);

  return (
    <div className="container mx-auto px-4 py-4">
      <ProductCatalogHeader 
        cart={cartForDialog}
        onCartClick={() => setShowCartDialog(true)}
      />
      
      <SearchBar onSearch={handleSearch} />
      
      <ProductCatalogTabs 
        activeTab={activeCategory} 
        onTabChange={handleCategoryChange}
      />
      {/* Build category tabs */}
      <div className="flex gap-2 my-3">
        <button
          className={`px-3 py-1 rounded ${activeSubcat === "ALL" ? "bg-green-600 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveSubcat("ALL")}
        >
          الكل
        </button>
        {menSubs.map(sub => (
          <button
            key={sub.id}
            className={`px-3 py-1 rounded ${activeSubcat === sub.id ? "bg-green-600 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveSubcat(sub.id)}
          >
            {sub.name}
          </button>
        ))}
      </div>
      {/* ... pass filteredProducts to ProductGrid ... */}
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
