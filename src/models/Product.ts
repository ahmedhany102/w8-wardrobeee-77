
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export enum ProductCategory {
  FOOD = "FOOD",
  TECHNOLOGY = "TECHNOLOGY",
  CLOTHING = "CLOTHING",
  SHOES = "SHOES",
}

// Mock database for products
class ProductDatabase {
  private static instance: ProductDatabase;
  private products: Product[];

  private constructor() {
    // Initialize with mock data or load from localStorage
    const savedProducts = localStorage.getItem('products');
    this.products = savedProducts ? JSON.parse(savedProducts) : this.generateMockProducts();
    this.persistToStorage();
  }

  public static getInstance(): ProductDatabase {
    if (!ProductDatabase.instance) {
      ProductDatabase.instance = new ProductDatabase();
    }
    return ProductDatabase.instance;
  }

  // Get all products
  public async getAllProducts(): Promise<Product[]> {
    return this.products;
  }

  // Get products by category
  public async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    return this.products.filter(product => product.category === category);
  }

  // Get product by ID
  public async getProductById(id: string): Promise<Product | undefined> {
    return this.products.find(product => product.id === id);
  }

  // Add product (admin only)
  public async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct = {
      ...product,
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.push(newProduct);
    this.persistToStorage();
    return newProduct;
  }

  // Update product (admin only)
  public async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | null> {
    const index = this.products.findIndex(product => product.id === id);
    
    if (index === -1) {
      return null;
    }
    
    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.persistToStorage();
    return this.products[index];
  }

  // Delete product (admin only)
  public async deleteProduct(id: string): Promise<boolean> {
    const initialLength = this.products.length;
    this.products = this.products.filter(product => product.id !== id);
    
    if (this.products.length !== initialLength) {
      this.persistToStorage();
      return true;
    }
    
    return false;
  }

  // Persist to localStorage
  private persistToStorage(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  // Generate sample products for testing
  private generateMockProducts(): Product[] {
    return [
      {
        id: 'product-1',
        name: 'Egyptian Koshari',
        description: 'Traditional Egyptian street food made with rice, lentils, chickpeas, pasta, and tomato sauce',
        price: 50,
        category: ProductCategory.FOOD,
        imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef9b49468?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3',
        stock: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-2',
        name: 'Smartphone X1',
        description: 'Latest generation smartphone with advanced camera and long battery life',
        price: 9999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3',
        stock: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-3',
        name: 'Egyptian Cotton Shirt',
        description: 'Premium shirt made from famous Egyptian cotton, known for its quality and comfort',
        price: 599,
        category: ProductCategory.CLOTHING,
        imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3',
        stock: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-4',
        name: 'Leather Sandals',
        description: 'Handcrafted leather sandals perfect for hot Egyptian summers',
        price: 399,
        category: ProductCategory.SHOES,
        imageUrl: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?q=80&w=2765&auto=format&fit=crop&ixlib=rb-4.0.3',
        stock: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

export default ProductDatabase;
