export enum ProductCategory {
  FOOD = "FOOD",
  TECHNOLOGY = "TECHNOLOGY",
  CLOTHING = "CLOTHING",
  SHOES = "SHOES",
}

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
  isActive?: boolean;
  hasDiscount?: boolean;
  discount?: number;
  sizes?: string[];
  colors?: string[];
  ingredients?: string[];
  plateSize?: string;
  details?: string;
}

export class ProductDatabase {
  private static instance: ProductDatabase;
  private products: Product[];
  
  private constructor() {
    // Initialize with mock data or load from localStorage
    const savedProducts = localStorage.getItem('products');
    this.products = savedProducts ? JSON.parse(savedProducts) : this.createMockProducts();
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
    return [...this.products].filter(p => p.isActive !== false);
  }
  
  // Get product by ID
  public async getProductById(productId: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === productId);
  }
  
  // Add product
  public async addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.products.push(newProduct);
    this.persistToStorage();
    
    return newProduct;
  }
  
  // Update product
  public async updateProduct(productId: string, productData: Partial<Product>): Promise<Product | null> {
    const productIndex = this.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return null;
    }
    
    this.products[productIndex] = {
      ...this.products[productIndex],
      ...productData,
      updatedAt: new Date().toISOString()
    };
    
    this.persistToStorage();
    
    return this.products[productIndex];
  }
  
  // Delete product
  public async deleteProduct(productId: string): Promise<boolean> {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== productId);
    
    if (this.products.length !== initialLength) {
      this.persistToStorage();
      return true;
    }
    
    return false;
  }
  
  // Search products
  public async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) || 
      product.description.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Filter products by category
  public async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    return this.products.filter(p => p.category === category);
  }
  
  // Create mock products for initial data
  private createMockProducts(): Product[] {
    return [
      {
        id: "product-1",
        name: "Egyptian Koshari",
        description: "Traditional Egyptian dish made with rice, lentils, and macaroni, topped with spiced tomato sauce and crispy onions.",
        price: 45.99,
        category: ProductCategory.FOOD,
        imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=2787&auto=format&fit=crop",
        stock: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasDiscount: true,
        discount: 20,
        ingredients: ["rice", "lentils", "macaroni"],
        plateSize: "large",
        details: "Traditional Egyptian dish"
      },
      {
        id: "product-2",
        name: "Ful Medames",
        description: "Traditional Egyptian breakfast dish of cooked fava beans served with olive oil, lemon juice, and cumin.",
        price: 35,
        category: ProductCategory.FOOD,
        imageUrl: "https://images.unsplash.com/photo-1590614338087-1a685d04aedc?w=800",
        stock: 80,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasDiscount: false,
        discount: 0,
        ingredients: ["fava beans"],
        plateSize: "medium",
        details: "Traditional Egyptian breakfast dish"
      },
      {
        id: "product-3",
        name: "Molokhia with Rice",
        description: "Egyptian comfort food made with minced jute leaves cooked in broth and served over rice.",
        price: 65,
        category: ProductCategory.FOOD,
        imageUrl: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=800",
        stock: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ingredients: ["jute leaves"],
        plateSize: "large",
        details: "Egyptian comfort food"
      },
      {
        id: "product-4",
        name: "Konafa Dessert",
        description: "Sweet Middle Eastern pastry made with thin vermicelli-like dough, filled with cream and nuts.",
        price: 45,
        category: ProductCategory.FOOD,
        imageUrl: "https://images.unsplash.com/photo-1530016910220-51bae09bd191?w=800",
        stock: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ingredients: ["vermicelli", "cream", "nuts"],
        plateSize: "small",
        details: "Sweet Middle Eastern pastry"
      },
      {
        id: "product-21",
        name: "Baklava",
        description: "Sweet pastry made of layers of filo filled with chopped nuts and sweetened with honey.",
        price: 55,
        category: ProductCategory.FOOD,
        imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800",
        stock: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ingredients: ["filo", "nuts", "honey"],
        plateSize: "large",
        details: "Sweet pastry made of layers of filo filled with chopped nuts and sweetened with honey"
      },
      {
        id: "product-22",
        name: "Shawarma Plate",
        description: "Grilled meat with vegetables and tahini sauce served with bread and pickles.",
        price: 70,
        category: ProductCategory.FOOD,
        imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
        stock: 55,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ingredients: ["meat", "vegetables", "tahini"],
        plateSize: "large",
        details: "Grilled meat with vegetables and tahini sauce served with bread and pickles"
      },
      
      // Technology Category
      {
        id: "product-5",
        name: "Smartphone X1",
        description: "Latest generation smartphone with advanced camera and long battery life.",
        price: 9999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?w=800",
        stock: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "product-6",
        name: "Ultra HD Smart TV",
        description: "65-inch 4K UHD Smart TV with voice control and AI upscaling.",
        price: 12999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
        stock: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "product-7",
        name: "Premium Wireless Headphones",
        description: "Noise-cancelling wireless headphones with 30-hour battery life and premium sound quality.",
        price: 3999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        stock: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "product-8",
        name: "Gaming Laptop Pro",
        description: "High-performance gaming laptop with RTX graphics card and 144Hz screen.",
        price: 22999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
        stock: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "product-23",
        name: "Tablet Pro",
        description: "10-inch tablet with high resolution display and powerful processor.",
        price: 6999,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
        stock: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "product-24",
        name: "Smart Watch Elite",
        description: "Advanced fitness tracker with heart rate monitor and GPS.",
        price: 3499,
        category: ProductCategory.TECHNOLOGY,
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800",
        stock: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // Clothing Category
      {
        id: "product-9",
        name: "Egyptian Cotton T-Shirt",
        description: "Premium t-shirt made from famous Egyptian cotton, known for its quality and comfort.",
        price: 399,
        category: ProductCategory.CLOTHING,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        stock: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["M", "L", "XL"],
        colors: ["white", "black"],
        details: "Premium t-shirt made from famous Egyptian cotton, known for its quality and comfort."
      },
      {
        id: "product-10",
        name: "Linen Summer Dress",
        description: "Light and elegant summer dress made from Egyptian linen in natural colors.",
        price: 899,
        category: ProductCategory.CLOTHING,
        imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800",
        stock: 70,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["S", "M", "L"],
        colors: ["white", "blue"],
        details: "Light and elegant summer dress made from Egyptian linen in natural colors."
      },
      {
        id: "product-11",
        name: "Winter Jacket",
        description: "Warm and waterproof winter jacket with modern design for cold weather.",
        price: 1499,
        category: ProductCategory.CLOTHING,
        imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
        stock: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["M", "L"],
        colors: ["black", "brown"],
        details: "Warm and waterproof winter jacket with modern design for cold weather."
      },
      {
        id: "product-12",
        name: "Designer Jeans",
        description: "Premium denim jeans with modern fit and sustainable production.",
        price: 799,
        category: ProductCategory.CLOTHING,
        imageUrl: "https://images.unsplash.com/photo-1542272604-7eec264c27ff?w=800",
        stock: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["30", "32", "34"],
        colors: ["blue", "black"],
        details: "Premium denim jeans with modern fit and sustainable production."
      },
      {
        id: "product-25",
        name: "Cotton Hoodie",
        description: "Comfortable cotton hoodie perfect for casual wear.",
        price: 599,
        category: ProductCategory.CLOTHING,
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        stock: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["M", "L"],
        colors: ["black", "gray"],
        details: "Comfortable cotton hoodie perfect for casual wear."
      },
      {
        id: "product-26",
        name: "Formal Shirt",
        description: "Classic formal shirt for business and special occasions.",
        price: 699,
        category: ProductCategory.CLOTHING,
        imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
        stock: 65,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["M", "L"],
        colors: ["white", "blue"],
        details: "Classic formal shirt for business and special occasions."
      },
      
      // Shoes Category
      {
        id: "product-13",
        name: "Leather Sandals",
        description: "Handcrafted leather sandals perfect for hot Egyptian summers.",
        price: 399,
        category: ProductCategory.SHOES,
        imageUrl: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800",
        stock: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["7", "8", "9"],
        colors: ["brown", "black"],
        details: "Handcrafted leather sandals perfect for hot Egyptian summers."
      },
      {
        id: "product-14",
        name: "Running Shoes",
        description: "Lightweight and comfortable running shoes for professional athletes and amateurs.",
        price: 1299,
        category: ProductCategory.SHOES,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        stock: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["9", "10", "11"],
        colors: ["black", "white"],
        details: "Lightweight and comfortable running shoes for professional athletes and amateurs."
      },
      {
        id: "product-15",
        name: "Formal Leather Shoes",
        description: "Elegant handcrafted leather shoes for formal occasions and business meetings.",
        price: 1599,
        category: ProductCategory.SHOES,
        imageUrl: "https://images.unsplash.com/photo-1478340019060-2755a3c84d66?w=800",
        stock: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["42", "43", "44"],
        colors: ["black", "brown"],
        details: "Elegant handcrafted leather shoes for formal occasions and business meetings."
      },
      {
        id: "product-16",
        name: "Desert Boots",
        description: "Classic desert boots made from high-quality suede, perfect for casual wear.",
        price: 899,
        category: ProductCategory.SHOES,
        imageUrl: "https://images.unsplash.com/photo-1610398752800-146f269dfcc8?w=800",
        stock: 55,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["7", "8", "9"],
        colors: ["brown", "black"],
        details: "Classic desert boots made from high-quality suede, perfect for casual wear."
      },
      {
        id: "product-27",
        name: "Sneakers",
        description: "Modern trendy sneakers for everyday casual wear.",
        price: 999,
        category: ProductCategory.SHOES,
        imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800",
        stock: 70,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["9", "10", "11"],
        colors: ["black", "white"],
        details: "Modern trendy sneakers for everyday casual wear."
      },
      {
        id: "product-28",
        name: "Hiking Boots",
        description: "Durable waterproof hiking boots for outdoor adventures.",
        price: 1799,
        category: ProductCategory.SHOES,
        imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
        stock: 35,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sizes: ["10", "11", "12"],
        colors: ["black", "brown"],
        details: "Durable waterproof hiking boots for outdoor adventures."
      }
    ];
  }
  
  // Persist to localStorage
  private persistToStorage(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
  }
}

export default ProductDatabase;
