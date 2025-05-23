
import { Product } from "./Product";
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  size?: string;
  color?: string;
}

class CartDatabase {
  private static instance: CartDatabase;
  private STORAGE_KEY = 'cart';

  private constructor() {}

  public static getInstance(): CartDatabase {
    if (!CartDatabase.instance) {
      CartDatabase.instance = new CartDatabase();
    }
    return CartDatabase.instance;
  }

  async getCartItems(): Promise<CartItem[]> {
    try {
      // Check if the user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // Get cart items from the database if logged in
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (error) {
          console.error("Error retrieving cart from Supabase:", error);
          // Fallback to local storage
          return this.getLocalCartItems();
        }
        
        return data.map(item => ({
          id: item.id,
          productId: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image_url,
          size: item.size,
          color: item.color
        }));
      }
      
      // If not authenticated, use localStorage
      return this.getLocalCartItems();
    } catch (error) {
      console.error("Error in getCartItems:", error);
      return this.getLocalCartItems();
    }
  }
  
  // Helper method to get cart items from local storage
  private getLocalCartItems(): CartItem[] {
    try {
      const cartItems = localStorage.getItem(this.STORAGE_KEY);
      return cartItems ? JSON.parse(cartItems) : [];
    } catch (error) {
      console.error("Error parsing local cart data:", error);
      return [];
    }
  }

  async addToCart(product: Product, size: string, color: string, quantity: number = 1): Promise<boolean> {
    try {
      const imageUrl = product.mainImage || (product.images && product.images[0]) || '';
      const price = (product.sizes || []).find(s => s.size === size)?.price || product.price;
      
      // Check for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // Check if the item already exists in the cart
        const { data: existingItems, error: findError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('product_id', product.id)
          .eq('size', size)
          .eq('color', color);
          
        if (findError) {
          console.error("Error checking for existing cart items:", findError);
          // Try local storage fallback
          return this.addToLocalCart(product, size, color, quantity, imageUrl, price);
        }
        
        if (existingItems && existingItems.length > 0) {
          // Update existing item quantity
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: existingItems[0].quantity + quantity })
            .eq('id', existingItems[0].id);
            
          if (updateError) {
            console.error("Error updating cart item quantity:", updateError);
            return false;
          }
        } else {
          // Insert new item
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              user_id: session.user.id,
              product_id: product.id,
              name: product.name,
              price: price,
              quantity: quantity,
              image_url: imageUrl,
              size: size,
              color: color
            });
            
          if (insertError) {
            console.error("Error adding item to cart:", insertError);
            return false;
          }
        }
        
        // Update local event for UI
        window.dispatchEvent(new Event('cartUpdated'));
        return true;
      }
      
      // If not authenticated, use local storage
      return this.addToLocalCart(product, size, color, quantity, imageUrl, price);
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  }
  
  // Helper method to add to local cart
  private addToLocalCart(
    product: Product, 
    size: string, 
    color: string, 
    quantity: number,
    imageUrl: string,
    price: number
  ): boolean {
    try {
      let cartItems = this.getLocalCartItems();
      
      // Check for existing item
      const existingItemIndex = cartItems.findIndex(
        item => item.productId === product.id && item.size === size && item.color === color
      );
      
      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: price,
          quantity: quantity,
          imageUrl: imageUrl,
          size: size,
          color: color
        };
        cartItems.push(newItem);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    } catch (error) {
      console.error("Error adding to local cart:", error);
      return false;
    }
  }

  async updateQuantity(itemId: string, quantity: number): Promise<boolean> {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(itemId);
      }
      
      // Check for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // Update in database
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: quantity })
          .eq('id', itemId)
          .eq('user_id', session.user.id);
          
        if (error) {
          console.error("Error updating cart item quantity:", error);
          return false;
        }
        
        window.dispatchEvent(new Event('cartUpdated'));
        return true;
      }
      
      // If not authenticated, use localStorage
      let cartItems = this.getLocalCartItems();
      const itemIndex = cartItems.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity = quantity;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cartItems));
        window.dispatchEvent(new Event('cartUpdated'));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error updating quantity:", error);
      return false;
    }
  }

  async removeFromCart(itemId: string): Promise<boolean> {
    try {
      // Check for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // Remove from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', session.user.id);
          
        if (error) {
          console.error("Error removing item from cart:", error);
          return false;
        }
        
        window.dispatchEvent(new Event('cartUpdated'));
        return true;
      }
      
      // If not authenticated, use localStorage
      let cartItems = this.getLocalCartItems();
      cartItems = cartItems.filter(item => item.id !== itemId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    }
  }

  async clearCart(): Promise<boolean> {
    try {
      // Check for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // Clear database cart
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', session.user.id);
          
        if (error) {
          console.error("Error clearing cart:", error);
          return false;
        }
      }
      
      // Always clear local storage as well
      localStorage.removeItem(this.STORAGE_KEY);
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  }

  async getCartTotal(): Promise<number> {
    try {
      const cartItems = await this.getCartItems();
      return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
      console.error("Error calculating cart total:", error);
      return 0;
    }
  }

  async getItemCount(): Promise<number> {
    try {
      const cartItems = await this.getCartItems();
      return cartItems.reduce((count, item) => count + item.quantity, 0);
    } catch (error) {
      console.error("Error calculating item count:", error);
      return 0;
    }
  }
}

export default CartDatabase;
