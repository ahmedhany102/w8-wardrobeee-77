
import { ProductFormData, ProductUpdateData } from '@/types/product';

// Safe product data validation helper
export const validateProductData = (product: any): any | null => {
  if (!product || typeof product !== 'object') {
    console.warn('⚠️ Invalid product data:', product);
    return null;
  }

  // Ensure sizes is always an array
  if (product.sizes && !Array.isArray(product.sizes)) {
    console.warn('⚠️ Product sizes is not an array, converting:', product.sizes);
    try {
      product.sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : [];
    } catch {
      product.sizes = [];
    }
  }

  // Ensure colors is always an array
  if (product.colors && !Array.isArray(product.colors)) {
    console.warn('⚠️ Product colors is not an array, converting:', product.colors);
    try {
      product.colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : [];
    } catch {
      product.colors = [];
    }
  }

  // Ensure images is always an array
  if (product.images && !Array.isArray(product.images)) {
    console.warn('⚠️ Product images is not an array, converting:', product.images);
    try {
      product.images = typeof product.images === 'string' ? JSON.parse(product.images) : [];
    } catch {
      product.images = [];
    }
  }

  // Set defaults for missing fields
  return {
    ...product,
    sizes: product.sizes || [],
    colors: product.colors || [],
    images: product.images || [],
    price: typeof product.price === 'number' ? product.price : 0,
    name: product.name || 'Unnamed Product',
    description: product.description || ''
  };
};

export const validateRequiredFields = (data: ProductFormData): string | null => {
  if (!data.name || data.name.trim() === '') {
    return 'Product name is required';
  }
  if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
    return 'Valid price is required';
  }
  if (!data.type || data.type.trim() === '') {
    return 'Product type is required';
  }
  return null;
};

export const validateUpdateFields = (data: ProductUpdateData): string | null => {
  if (data.name !== undefined && (!data.name || data.name.trim() === '')) {
    return 'Product name cannot be empty';
  }
  if (data.price !== undefined && (isNaN(Number(data.price)) || Number(data.price) <= 0)) {
    return 'Valid price is required';
  }
  return null;
};
