
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
      // Food Category
      {
        id: 'product-1',
        name: 'Egyptian Koshari',
        description: 'Traditional Egyptian street food made with rice, lentils, chickpeas, pasta, and tomato sauce',
        price: 50,
        category: ProductCategory.FOOD,
        imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef9b49468?w=800',
        stock: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-2',
        name: 'Ful Medames',
        description: 'Traditional Egyptian breakfast dish of cooked fava beans served with olive oil, lemon juice, and cumin',
        price: 35,
        category: ProductCategory.FOOD,
        imageUrl: 'https://images.unsplash.com/photo-1590614338087-1a685d04aedc?w=800',
        stock: 80,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-3',
        name: 'Molokhia with Rice',
        description: 'Egyptian comfort food made with minced jute leaves cooked in broth and served over rice',
        price: 65,
        category: ProductCategory.FOOD,
        imageUrl: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800',
        stock: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-4',
        name: 'Konafa Dessert',
        description: 'Sweet Middle Eastern pastry made with thin vermicelli-like dough, filled with cream and nuts',
        price: 45,
        category: ProductCategory.FOOD,
        imageUrl: 'https://images.unsplash.com/photo-1530016910220-51bae09bd191?w=800',
        stock: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      
      // Technology Category
      {
        id: 'product-5',
        name: 'Smartphone X1',
        description: 'Latest generation smartphone with advanced camera and long battery life',
        price: 9999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?w=800',
        stock: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-6',
        name: 'Ultra HD Smart TV',
        description: '65-inch 4K UHD Smart TV with voice control and AI upscaling',
        price: 12999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
        stock: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-7',
        name: 'Premium Wireless Headphones',
        description: 'Noise-cancelling wireless headphones with 30-hour battery life and premium sound quality',
        price: 3999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        stock: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-8',
        name: 'Gaming Laptop Pro',
        description: 'High-performance gaming laptop with RTX graphics card and 144Hz screen',
        price: 22999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
        stock: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      
      // Clothing Category
      {
        id: 'product-9',
        name: 'Egyptian Cotton T-Shirt',
        description: 'Premium t-shirt made from famous Egyptian cotton, known for its quality and comfort',
        price: 399,
        category: ProductCategory.CLOTHING,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        stock: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-10',
        name: 'Linen Summer Dress',
        description: 'Light and elegant summer dress made from Egyptian linen in natural colors',
        price: 899,
        category: ProductCategory.CLOTHING,
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
        stock: 70,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-11',
        name: 'Winter Jacket',
        description: 'Warm and waterproof winter jacket with modern design for cold weather',
        price: 1499,
        category: ProductCategory.CLOTHING,
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
        stock: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-12',
        name: 'Designer Jeans',
        description: 'Premium denim jeans with modern fit and sustainable production',
        price: 799,
        category: ProductCategory.CLOTHING,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
        stock: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      
      // Shoes Category
      {
        id: 'product-13',
        name: 'Leather Sandals',
        description: 'Handcrafted leather sandals perfect for hot Egyptian summers',
        price: 399,
        category: ProductCategory.SHOES,
        imageUrl: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800',
        stock: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-14',
        name: 'Running Shoes',
        description: 'Lightweight and comfortable running shoes for professional athletes and amateurs',
        price: 1299,
        category: ProductCategory.SHOES,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        stock: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-15',
        name: 'Formal Leather Shoes',
        description: 'Elegant handcrafted leather shoes for formal occasions and business meetings',
        price: 1599,
        category: ProductCategory.SHOES,
        imageUrl: 'https://images.unsplash.com/photo-1478340019060-2755a3c84d66?w=800',
        stock: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product-16',
        name: 'Desert Boots',
        description: 'Classic desert boots made from high-quality suede, perfect for casual wear',
        price: 899,
        category: ProductCategory.SHOES,
        imageUrl: 'https://images.unsplash.com/photo-1610398752800-146f269dfcc8?w=800',
        stock: 55,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  }
}

export default ProductDatabase;
