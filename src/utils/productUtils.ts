
import { ProductFormData, CleanProductData, ProductUpdateData, ProductSize } from '@/types/product';

export const validateRequiredFields = (productData: ProductFormData): string | null => {
  if (!productData.name?.trim()) {
    return 'Product name is required';
  }
  
  if (!productData.price || parseFloat(productData.price.toString()) <= 0) {
    return 'Valid product price is required';
  }

  if (!productData.type) {
    return 'Product type is required';
  }

  return null;
};

export const validateUpdateFields = (updates: ProductUpdateData): string | null => {
  if (updates.name && !updates.name.trim()) {
    return 'Product name cannot be empty';
  }
  
  if (updates.price && parseFloat(updates.price.toString()) <= 0) {
    return 'Valid product price is required';
  }

  return null;
};

export const cleanProductDataForInsert = (productData: ProductFormData, userId: string): CleanProductData => {
  return {
    user_id: userId,
    name: productData.name.trim(),
    description: productData.description?.trim() || '',
    price: parseFloat(productData.price.toString()),
    type: productData.type,
    category: productData.category || 'Men',
    main_image: productData.main_image || '',
    image_url: productData.main_image || '',
    images: Array.isArray(productData.images) ? productData.images.filter(Boolean) : [],
    colors: Array.isArray(productData.colors) ? productData.colors.filter(Boolean) : [],
    sizes: Array.isArray(productData.sizes) ? productData.sizes.filter(size => size?.size) : [],
    discount: parseFloat(productData.discount?.toString() || '0') || 0,
    featured: Boolean(productData.featured),
    stock: parseInt(productData.stock?.toString() || '0') || 0,
    inventory: parseInt(productData.inventory?.toString() || productData.stock?.toString() || '0') || 0,
    status: 'active'
  };
};

export const cleanProductDataForUpdate = (updates: ProductUpdateData): Partial<CleanProductData> => {
  const cleanUpdates: Partial<CleanProductData> = {};

  if (updates.name) cleanUpdates.name = updates.name.trim();
  if (updates.description !== undefined) cleanUpdates.description = updates.description?.trim() || '';
  if (updates.price) cleanUpdates.price = parseFloat(updates.price.toString());
  if (updates.type) cleanUpdates.type = updates.type;
  if (updates.category) cleanUpdates.category = updates.category;
  if (updates.main_image !== undefined) {
    cleanUpdates.main_image = updates.main_image || '';
    cleanUpdates.image_url = updates.main_image || '';
  }
  if (updates.images) cleanUpdates.images = Array.isArray(updates.images) ? updates.images.filter(Boolean) : [];
  if (updates.colors) cleanUpdates.colors = Array.isArray(updates.colors) ? updates.colors.filter(Boolean) : [];
  if (updates.sizes) cleanUpdates.sizes = Array.isArray(updates.sizes) ? updates.sizes.filter(size => size?.size) : [];
  if (updates.discount !== undefined) cleanUpdates.discount = parseFloat(updates.discount.toString()) || 0;
  if (updates.featured !== undefined) cleanUpdates.featured = Boolean(updates.featured);
  if (updates.stock !== undefined) cleanUpdates.stock = parseInt(updates.stock.toString()) || 0;
  if (updates.inventory !== undefined) cleanUpdates.inventory = parseInt(updates.inventory.toString()) || parseInt(updates.stock?.toString() || '0') || 0;

  return cleanUpdates;
};
