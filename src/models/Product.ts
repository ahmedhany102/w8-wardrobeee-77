import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Define the Product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventory: number;
  featured?: boolean;
  discount?: number;
  rating?: number;
  images: string[];
  color?: string;
  size?: string;
  createdAt: string;
  updatedAt: string;
  // Adding properties referenced elsewhere in the codebase
  type?: string; // Used for categories: T-Shirts, Trousers, Shoes, Jackets
  details?: string;
  mainImage?: string;
  colors?: string[];
  sizes?: SizeWithStock[];
  hasDiscount?: boolean;
  stock?: number;
  imageUrl?: string;
  // Adding support for nested categories
  categoryPath?: string[];
  // Adding support for color-specific images
  colorImages?: Record<string, string[]>;
  // Link to ads
  adProductId?: string;
}

export interface ColorImage {
  color: string;
  imageUrl: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  color?: string;
  size?: string;
  // Additional properties referenced in OrdersPanel
  productName?: string;
  unitPrice?: number;
  totalPrice?: number;
  imageUrl?: string;
}

// Define the SizeItem interface used in Product model
export interface SizeItem {
  size: string;
  price: number;
  stock: number;
  image?: string;
}

// Define SizeWithStock interface for sizes with stock and price
export interface SizeWithStock {
  size: string;
  stock: number;
  price: number;
}

// Type for Json compatibility with Supabase
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ProductDatabase class for managing products
export class ProductDatabase {
  private static instance: ProductDatabase;

  private constructor() {}

  public static getInstance(): ProductDatabase {
    if (!ProductDatabase.instance) {
      ProductDatabase.instance = new ProductDatabase();
    }
    return ProductDatabase.instance;
  }

  public async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Men');

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      // Map database fields to camelCase for frontend
      return data.map(this.mapDatabaseProductToModel);
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      return [];
    }
  }

  public async getProductById(id: string | undefined): Promise<Product | null> {
    if (!id) return null;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching product by ID:', error);
        return null;
      }

      return this.mapDatabaseProductToModel(data);
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  }

  public async addProduct(productData: Omit<Product, "id">): Promise<Product> {
    // Ensure product is in Men category
    const validTypes = ['T-Shirts', 'Trousers', 'Shoes', 'Jackets'];
    if (!productData.type || !validTypes.includes(productData.type)) {
      productData.type = validTypes[0]; // Default to T-Shirts if invalid
    }
    
    // Serialize complex objects to JSON strings for Supabase
    const sizes = productData.sizes ? JSON.stringify(productData.sizes) : null;
    const colorImages = productData.colorImages ? JSON.stringify(productData.colorImages) : null;
    
    // Map to database format (snake_case)
    const dbProduct = {
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      category: 'Men',
      type: productData.type,
      inventory: productData.inventory || 0,
      featured: productData.featured || false,
      discount: productData.discount || 0,
      rating: productData.rating,
      images: productData.images || [],
      color: productData.color,
      size: productData.size,
      sizes: sizes,
      has_discount: productData.hasDiscount || false,
      stock: productData.stock || 0,
      main_image: productData.mainImage || productData.images?.[0],
      colors: productData.colors || [],
      image_url: productData.imageUrl,
      category_path: productData.categoryPath || [],
      color_images: colorImages,
      details: productData.details,
      ad_product_id: productData.adProductId
    };
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        // Fallback to creating locally with UUID if there's an auth error
        if (error.code === 'PGRST116') {
          const newProduct: Product = {
            ...productData,
            id: uuidv4(),
            category: 'Men',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return newProduct;
        }
        throw error;
      }

      return this.mapDatabaseProductToModel(data);
    } catch (error) {
      console.error('Error in addProduct:', error);
      // Create a local product as fallback
      const newProduct: Product = {
        ...productData,
        id: uuidv4(),
        category: 'Men',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newProduct;
    }
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    // Ensure updated product stays in allowed categories
    const validTypes = ['T-Shirts', 'Trousers', 'Shoes', 'Jackets'];
    if (updates.type && !validTypes.includes(updates.type)) {
      updates.type = validTypes[0];
    }
    
    // Map to database format (snake_case)
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.inventory !== undefined) dbUpdates.inventory = updates.inventory;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.images) dbUpdates.images = updates.images;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.size !== undefined) dbUpdates.size = updates.size;
    if (updates.sizes !== undefined) dbUpdates.sizes = JSON.stringify(updates.sizes);
    if (updates.hasDiscount !== undefined) dbUpdates.has_discount = updates.hasDiscount;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.mainImage !== undefined) dbUpdates.main_image = updates.mainImage;
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.categoryPath !== undefined) dbUpdates.category_path = updates.categoryPath;
    if (updates.colorImages !== undefined) dbUpdates.color_images = JSON.stringify(updates.colorImages);
    if (updates.details !== undefined) dbUpdates.details = updates.details;
    dbUpdates.category = 'Men'; // Always ensure it's Men's category
    dbUpdates.updated_at = new Date().toISOString();
    
    try {
      const { error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return false;
    }
  }
  
  // Update stock quantity after purchase
  public async updateProductStock(productId: string, size: string, quantity: number): Promise<boolean> {
    try {
      // First get the current product
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (fetchError || !product) {
        console.error('Error fetching product for stock update:', fetchError);
        return false;
      }
      
      // Update the stock based on whether we're using sizes
      if (product.sizes) {
        // Parse sizes from JSON (it comes as a string from Supabase)
        let sizes: SizeWithStock[] = [];
        try {
          if (typeof product.sizes === 'string') {
            sizes = JSON.parse(product.sizes);
          } else if (Array.isArray(product.sizes)) {
            sizes = product.sizes as unknown as SizeWithStock[];
          } else {
            console.error('Unexpected sizes format:', product.sizes);
            return false;
          }
        } catch (e) {
          console.error('Error parsing sizes:', e);
          return false;
        }
        
        const sizeIndex = sizes.findIndex((s) => s.size === size);
        if (sizeIndex === -1) return false;
        
        // Ensure we don't go below 0
        sizes[sizeIndex].stock = Math.max(0, sizes[sizeIndex].stock - quantity);
        
        // Update the product with the new sizes
        const { error: updateError } = await supabase
          .from('products')
          .update({ sizes: JSON.stringify(sizes) })
          .eq('id', productId);
        
        if (updateError) {
          console.error('Error updating product stock (sizes):', updateError);
          return false;
        }
        
        return true;
      } else if (product.stock !== undefined) {
        // Update the single stock value
        const newStock = typeof product.stock === 'number' 
          ? Math.max(0, product.stock - quantity) 
          : 0;
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', productId);
        
        if (updateError) {
          console.error('Error updating product stock:', updateError);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in updateProductStock:', error);
      return false;
    }
  }

  public async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return false;
    }
  }

  // Helper method to convert database fields (snake_case) to model fields (camelCase)
  private mapDatabaseProductToModel(dbProduct: any): Product {
    // Parse JSON strings for complex objects
    let sizes: SizeWithStock[] | undefined = undefined;
    let colorImages: Record<string, string[]> | undefined = undefined;
    
    try {
      if (dbProduct.sizes) {
        sizes = typeof dbProduct.sizes === 'string' 
          ? JSON.parse(dbProduct.sizes) 
          : (dbProduct.sizes as unknown as SizeWithStock[]);
      }
      
      if (dbProduct.color_images) {
        colorImages = typeof dbProduct.color_images === 'string'
          ? JSON.parse(dbProduct.color_images)
          : dbProduct.color_images;
      }
    } catch (e) {
      console.error('Error parsing JSON from database:', e);
    }
    
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description || '',
      price: dbProduct.price,
      category: dbProduct.category,
      inventory: dbProduct.inventory || 0,
      featured: dbProduct.featured || false,
      discount: dbProduct.discount || 0,
      rating: dbProduct.rating,
      images: dbProduct.images || [],
      color: dbProduct.color,
      size: dbProduct.size,
      createdAt: dbProduct.created_at,
      updatedAt: dbProduct.updated_at,
      type: dbProduct.type,
      details: dbProduct.details,
      mainImage: dbProduct.main_image || dbProduct.images?.[0],
      colors: dbProduct.colors || [],
      sizes: sizes,
      hasDiscount: dbProduct.has_discount || false,
      stock: dbProduct.stock || 0,
      imageUrl: dbProduct.image_url,
      categoryPath: dbProduct.category_path || [],
      colorImages: colorImages,
      adProductId: dbProduct.ad_product_id
    };
  }
}

// Export the ProductDatabase class as default and named export
export default ProductDatabase;
