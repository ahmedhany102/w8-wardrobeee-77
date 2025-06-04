
export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number | string;
  type: string;
  category?: string;
  main_image?: string;
  images?: string[];
  colors?: string[];
  sizes?: ProductSize[];
  discount?: number | string;
  featured?: boolean;
  stock?: number | string;
  inventory?: number | string;
}

export interface CleanProductData {
  user_id?: string;
  name: string;
  description: string;
  price: number;
  type: string;
  category: string;
  main_image: string;
  image_url: string;
  images: string[];
  colors: string[];
  sizes: ProductSize[];
  discount: number;
  featured: boolean;
  stock: number;
  inventory: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number | string;
  type?: string;
  category?: string;
  main_image?: string;
  images?: string[];
  colors?: string[];
  sizes?: ProductSize[];
  discount?: number | string;
  featured?: boolean;
  stock?: number | string;
  inventory?: number | string;
}
