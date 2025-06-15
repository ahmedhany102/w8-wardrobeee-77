
import { useState, useEffect } from 'react';
import CartDatabase from '@/models/CartDatabase';
import { Product } from '@/models/Product';
import { toast } from 'sonner';

// Add color_variant_id, option_id
export const useCartIntegration = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const loadCartItems = async () => {
    try {
      const cartDb = CartDatabase.getInstance();
      const items = await cartDb.getCartItems();
      setCartItems(items);
      const count = await cartDb.getItemCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error loading cart items:', error);
    }
  };

  useEffect(() => { loadCartItems(); }, []);

  // Adjust signature: add colorVariantId, optionId
  const addToCart = async (
    product: Product, 
    selectedSize: string, 
    selectedColor: string, 
    quantity: number = 1, 
    colorVariantId?: string, 
    optionId?: string
  ): Promise<boolean> => {
    try {
      if (!selectedSize) {
        toast.error('يرجى اختيار المقاس');
        return false;
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        toast.error('يرجى اختيار اللون');
        return false;
      }
      const cartDb = CartDatabase.getInstance();
      // Save variant/option IDs (forward to DB/model)
      const success = await cartDb.addToCart(
        { ...product, color_variant_id: colorVariantId, option_id: optionId }, 
        selectedSize, 
        selectedColor, 
        quantity, 
        colorVariantId, 
        optionId
      );
      if (success) {
        toast.success('تم إضافة المنتج إلى العربة بنجاح!');
        await loadCartItems();
        return true;
      } else {
        toast.error('حدث خطأ أثناء إضافة المنتج إلى العربة');
        return false;
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المنتج إلى العربة');
      return false;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const cartDb = CartDatabase.getInstance();
      const success = await cartDb.removeFromCart(itemId);
      
      if (success) {
        toast.success('تم حذف المنتج من العربة');
        await loadCartItems();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('حدث خطأ أثناء حذف المنتج');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const cartDb = CartDatabase.getInstance();
      const success = await cartDb.updateQuantity(itemId, quantity);
      
      if (success) {
        await loadCartItems();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('حدث خطأ أثناء تحديث الكمية');
    }
  };

  const clearCart = async () => {
    try {
      const cartDb = CartDatabase.getInstance();
      const success = await cartDb.clearCart();
      
      if (success) {
        toast.success('تم إفراغ العربة');
        await loadCartItems();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('حدث خطأ أثناء إفراغ العربة');
    }
  };

  return {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart: loadCartItems
  };
};
