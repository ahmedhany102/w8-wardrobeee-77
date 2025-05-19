
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
  sizes?: string[];
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

// Create a SizeItem interface since it's used in ProductForm.tsx
export interface SizeItem {
  value: string;
  label: string;
}
