
import { ProductFormData, ProductUpdateData, DatabaseProductData } from '@/types/product';

export const cleanProductDataForInsert = (data: ProductFormData, userId: string): DatabaseProductData => {
  console.log('🧹 Cleaning product data for insert:', data);
  
  const cleanData: DatabaseProductData = {
    user_id: userId,
    name: data.name.trim(),
    description: data.description?.trim() || '',
    price: parseFloat(String(data.price)),
    type: data.type,
    category: data.category || 'Men',
    main_image: data.main_image || '',
    image_url: data.main_image || '',
    images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
    colors: Array.isArray(data.colors) ? data.colors.filter(Boolean) : [],
    sizes: Array.isArray(data.sizes) ? data.sizes.filter(size => size?.size) : [],
    discount: parseFloat(String(data.discount)) || 0,
    featured: Boolean(data.featured),
    stock: parseInt(String(data.stock)) || 0,
    inventory: parseInt(String(data.inventory)) || parseInt(String(data.stock || 0)) || 0
  };
  
  console.log('✅ Cleaned data for database:', cleanData);
  return cleanData;
};

export const cleanProductDataForUpdate = (data: ProductUpdateData): Record<string, any> => {
  console.log('🧹 Cleaning product data for update:', data);
  
  const updateData: Record<string, any> = {};
  
  if (data.name) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() || '';
  if (data.price) updateData.price = parseFloat(String(data.price));
  if (data.type) updateData.type = data.type;
  if (data.category) updateData.category = data.category;
  if (data.main_image !== undefined) {
    updateData.main_image = data.main_image || '';
    updateData.image_url = data.main_image || '';
  }
  if (data.images) updateData.images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
  if (data.colors) updateData.colors = Array.isArray(data.colors) ? data.colors.filter(Boolean) : [];
  if (data.sizes) updateData.sizes = Array.isArray(data.sizes) ? data.sizes.filter(size => size?.size) : [];
  if (data.discount !== undefined) updateData.discount = parseFloat(String(data.discount)) || 0;
  if (data.featured !== undefined) updateData.featured = Boolean(data.featured);
  if (data.stock !== undefined) updateData.stock = parseInt(String(data.stock)) || 0;
  if (data.inventory !== undefined) updateData.inventory = parseInt(String(data.inventory)) || parseInt(String(data.stock || 0)) || 0;
  
  console.log('✅ Cleaned update data:', updateData);
  return updateData;
};
