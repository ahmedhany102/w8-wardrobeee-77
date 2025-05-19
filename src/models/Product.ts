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
  // Adding support for nested categories
  categoryPath?: string[];
  // Adding support for color-specific images
  colorImages?: ColorImage[];
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
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'w8StoreDB';
  private readonly STORE_NAME = 'products';

  private constructor() {
    this.initDB();
  }

  public static getInstance(): ProductDatabase {
    if (!ProductDatabase.instance) {
      ProductDatabase.instance = new ProductDatabase();
    }
    return ProductDatabase.instance;
  }

  private initDB(): void {
    const request = indexedDB.open(this.DB_NAME, 1);

    request.onerror = (event) => {
      console.error('Error opening database:', event);
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.loadProducts();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.STORE_NAME)) {
        db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
      }
    };
  }

  private loadProducts(): void {
    if (!this.db) return;

    const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
    const store = transaction.objectStore(this.STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      this.products = request.result || [];
      window.dispatchEvent(new Event('productsUpdated'));
    };

    request.onerror = (event) => {
      console.error('Error loading products:', event);
      this.products = [];
    };
  }

  private saveProducts(): void {
    if (!this.db) return;

    const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);

    // Clear existing products
    store.clear();

    // Add all products
    this.products.forEach(product => {
      store.add(product);
    });

    transaction.oncomplete = () => {
      window.dispatchEvent(new Event('productsUpdated'));
    };

    transaction.onerror = (event) => {
      console.error('Error saving products:', event);
    };
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
