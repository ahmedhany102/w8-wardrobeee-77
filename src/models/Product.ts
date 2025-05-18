export type ProductCategory = "رجالي" | "حريمي" | "أطفال";

export interface ProductSize {
  size: string;
  price: number;
  stock: number;
  image?: string; // base64 or url
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  type: string; // تشيرت، قميص، بنطلون، فستان، حذاء...
  sizes: ProductSize[];
  colors: string[];
  mainImage: string; // base64 or url
  images?: string[];
  details?: string;
  hasDiscount?: boolean;
  discount?: number;
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
    return [...this.products];
  }
  
  // Get product by ID
  public async getProductById(productId: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === productId);
  }
  
  // Add product
  public async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      product.type.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Create mock products for initial data (clothing/shoes only)
  private createMockProducts(): Product[] {
    return [
      {
        id: "product-1",
        name: "تشيرت قطن مصري",
        category: "رجالي",
        type: "تشيرت",
        sizes: [
          { size: "M", price: 350, stock: 10, image: "" },
          { size: "L", price: 350, stock: 5, image: "" },
          { size: "XL", price: 370, stock: 0, image: "" },
        ],
        colors: ["أبيض", "أسود"],
        mainImage: "",
        details: "تشيرت قطن مصري عالي الجودة، مريح في اللبس.",
        hasDiscount: true,
        discount: 15,
      },
      {
        id: "product-2",
        name: "فستان صيفي",
        category: "حريمي",
        type: "فستان",
        sizes: [
          { size: "S", price: 500, stock: 7, image: "" },
          { size: "M", price: 520, stock: 2, image: "" },
        ],
        colors: ["أزرق", "وردي"],
        mainImage: "",
        details: "فستان صيفي خفيف وأنيق.",
        hasDiscount: false,
        discount: 0,
      },
      {
        id: "product-3",
        name: "حذاء رياضي أطفال",
        category: "أطفال",
        type: "حذاء رياضي",
        sizes: [
          { size: "28", price: 250, stock: 4, image: "" },
          { size: "30", price: 260, stock: 0, image: "" },
        ],
        colors: ["أحمر", "أزرق"],
        mainImage: "",
        details: "حذاء رياضي مريح للأطفال.",
        hasDiscount: false,
        discount: 0,
      },
    ];
  }
  
  // Persist to localStorage
  private persistToStorage(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
  }
}

export default ProductDatabase;
