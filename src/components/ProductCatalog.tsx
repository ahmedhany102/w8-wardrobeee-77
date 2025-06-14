
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
  const [activeSubcat, setActiveSubcat] = React.useState<string>("ALL");

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

  // Get Men category and its subcategories
  const menCat = mainCategories.find(c => c.slug === "men");
  const menSubs = menCat ? subcategories(menCat.id) : [];

  // Filter products based on selected subcategory - FIXED LOGIC
  const filteredProducts = React.useMemo(() => {
    let baseProducts = searchFilteredProducts;
    
    console.log('🔍 Filtering products:', {
      activeSubcat,
      totalProducts: baseProducts.length,
      menSubs: menSubs.map(s => ({ id: s.id, name: s.name }))
    });
    
    if (activeSubcat === "ALL") {
      console.log('✅ Showing all products:', baseProducts.length);
      return baseProducts;
    }
    
    // Filter by selected subcategory using category_id - FIXED
    const filtered = baseProducts.filter(p => {
      const matches = p.category_id === activeSubcat;
      console.log('📦 Product category check:', {
        productName: p.name,
        productCategoryId: p.category_id,
        targetCategoryId: activeSubcat,
        matches
      });
      return matches;
    });
    
    console.log('✅ Filtered products result:', filtered.length);
    return filtered;
  }, [searchFilteredProducts, activeSubcat, menSubs]);

  // Handle category tab changes from ProductCatalogTabs - FIXED
  const handleTabChange = (value: string) => {
    console.log('🎯 Tab changed to:', value);
    
    // Map tab values to subcategory IDs
    if (value === "ALL") {
      setActiveSubcat("ALL");
    } else {
      // Find the subcategory that matches the tab value
      const matchingSubcat = menSubs.find(sub => 
        sub.name.toLowerCase().includes(value.toLowerCase()) ||
        value.toLowerCase().includes(sub.name.toLowerCase())
      );
      
      if (matchingSubcat) {
        console.log('✅ Found matching subcategory:', matchingSubcat);
        setActiveSubcat(matchingSubcat.id);
      } else {
        console.log('❌ No matching subcategory found, showing all');
        setActiveSubcat("ALL");
      }
    }
    
    // Also call the original category change handler
    handleCategoryChange(value);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <ProductCatalogHeader 
        cart={cartForDialog}
        onCartClick={() => setShowCartDialog(true)}
      />
      
      <SearchBar onSearch={handleSearch} />
      
      <ProductCatalogTabs 
        activeTab={activeCategory} 
        onTabChange={handleTabChange}
      >
        <ProductGrid 
          products={filteredProducts}
          loading={loading}
          searchQuery={searchQuery}
          onAddToCart={handleAddToCart}
          onClearSearch={clearFilters}
        />
      </ProductCatalogTabs>

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
