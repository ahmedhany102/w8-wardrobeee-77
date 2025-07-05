
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Upload, Plus } from 'lucide-react';
import CategorySelector from './CategorySelector';
import ProductColorVariantManager from './ProductColorVariantManager';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  main_image: string;
  discount: number;
  featured: boolean;
}

interface ColorVariant {
  id?: string;
  color: string;
  image: string | null;
  options: {
    id?: string;
    size: string;
    price: number;
    stock: number;
  }[];
}

interface ImprovedProductFormProps {
  product?: any;
  onSubmit: (productData: any, variants?: ColorVariant[]) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

const ImprovedProductForm: React.FC<ImprovedProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category_id: product?.category_id || '',
    main_image: product?.main_image || product?.image_url || '',
    discount: product?.discount || 0,
    featured: product?.featured || false
  });

  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [imagePreview, setImagePreview] = useState<string>(formData.main_image);

  console.log('🎯 ImprovedProductForm - Initial category_id:', product?.category_id);
  console.log('🎯 ImprovedProductForm - Form category_id:', formData.category_id);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    console.log(`📝 Form field ${field} changed to:`, value);
    
    if (field === 'category_id') {
      console.log('🎯 CRITICAL - Category ID being set:', value);
      if (!value || value === '' || value === 'placeholder') {
        console.error('❌ Invalid category_id attempted:', value);
        toast.error('Please select a valid category');
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        handleInputChange('main_image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission starting...');
    console.log('📋 Form data:', formData);
    console.log('🎨 Variants data:', variants);
    
    // CRITICAL: Validate category_id before submission
    if (!formData.category_id || formData.category_id === '' || formData.category_id === 'placeholder') {
      console.error('❌ BLOCKED - Invalid category_id:', formData.category_id);
      toast.error('Please select a valid category before saving');
      return;
    }
    
    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    if (!formData.main_image?.trim()) {
      toast.error('Main product image is required');
      return;
    }
    
    if (formData.price <= 0) {
      toast.error('Product price must be greater than 0');
      return;
    }
    
    try {
      console.log('📤 Sending to onSubmit with category_id:', formData.category_id);
      
      const success = await onSubmit(formData, variants);
      
      if (success) {
        console.log('✅ Product saved successfully');
        // Don't reset form on edit, only on create
        if (!product) {
          setFormData({
            name: '',
            description: '',
            price: 0,
            category_id: '',
            main_image: '',
            discount: 0,
            featured: false
          });
          setVariants([]);
          setImagePreview('');
        }
      }
    } catch (error) {
      console.error('💥 Form submission error:', error);
      toast.error('Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Category Selection */}
          <CategorySelector
            value={formData.category_id}
            onChange={(categoryId) => {
              console.log('🎯 CategorySelector onChange called with:', categoryId);
              handleInputChange('category_id', categoryId);
            }}
          />

          {/* Main Image */}
          <div>
            <Label htmlFor="main_image">Main Product Image *</Label>
            <div className="flex gap-4 items-start">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1"
              />
              <Input
                placeholder="Or paste image URL"
                value={formData.main_image}
                onChange={(e) => {
                  const url = e.target.value;
                  handleInputChange('main_image', url);
                  setImagePreview(url);
                }}
                className="flex-1"
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded border"
                  onError={() => {
                    setImagePreview('');
                    toast.error('Invalid image URL');
                  }}
                />
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">Base Price (EGP) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          {/* Discount */}
          <div>
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              value={formData.discount}
              onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              max="100"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>
        </CardContent>
      </Card>

      {/* Color Variants Manager */}
      <ProductColorVariantManager
        variants={variants}
        onChange={setVariants}
        productId={product?.id}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ImprovedProductForm;
