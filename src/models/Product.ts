import { v4 as uuidv4 } from 'uuid';

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
  type?: string;
  details?: string;
  mainImage?: string;
  colors?: string[];
  sizes?: SizeWithStock[];
  hasDiscount?: boolean;
  stock?: number;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  color?: string;
  size?: string;
}

// Define the SizeItem interface used in Product model
export interface SizeItem {
  value: string;
  label: string;
}

// Define SizeWithStock interface for sizes with stock and price
export interface SizeWithStock {
  size: string;
  stock: number;
  price: number;
}

// ProductDatabase class for managing products
export class ProductDatabase {
  private static instance: ProductDatabase;
  private products: Product[] = [];

  private constructor() {
    this.loadProducts();
  }

  public static getInstance(): ProductDatabase {
    if (!ProductDatabase.instance) {
      ProductDatabase.instance = new ProductDatabase();
    }
    return ProductDatabase.instance;
  }

  private loadProducts(): void {
    try {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        this.products = JSON.parse(storedProducts);
      } else {
        this.products = [];
      }
    } catch (error) {
      console.error('Error loading products:', error);
      this.products = [];
    }
  }

  private saveProducts(): void {
    try {
      localStorage.setItem('products', JSON.stringify(this.products));
      // Dispatch an event to notify components that products have been updated
      window.dispatchEvent(new Event('productsUpdated'));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }

  public async getAllProducts(): Promise<Product[]> {
    return this.products;
  }

  public async getProductById(id: string | undefined): Promise<Product | null> {
    if (!id) return null;
    const product = this.products.find(p => p.id === id);
    return product || null;
  }

  public async addProduct(productData: Omit<Product, "id">): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: productData.description || '',
      inventory: productData.inventory || 0,
    };
    
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveProducts();
    return true;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    
    if (this.products.length !== initialLength) {
      this.saveProducts();
      return true;
    }
    return false;
  }
}

// Export the ProductDatabase class as default and named export
export default ProductDatabase;
