import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ImageUploader from '@/components/admin/ImageUploader';
import CategorySelector from '@/components/admin/CategorySelector';
import { ProductFormData } from '@/types/product';
import { VendorProduct } from '@/hooks/useVendorProducts';

interface VendorProductFormProps {
  initialData?: VendorProduct | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const VendorProductForm: React.FC<VendorProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || '',
    main_image: initialData?.main_image || initialData?.image_url || '',
    images: initialData?.images || [],
    colors: initialData?.colors || [],
    sizes: initialData?.sizes || [],
    discount: initialData?.discount || 0,
    featured: initialData?.featured || false,
    stock: initialData?.stock || initialData?.inventory || 0,
    inventory: initialData?.inventory || initialData?.stock || 0,
  });

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم المنتج *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="أدخل اسم المنتج"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">السعر (ج.م) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف المنتج</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="أدخل وصف المنتج"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>الفئة</Label>
          <CategorySelector
            value={formData.category || ''}
            onChange={(value) => handleChange('category', value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">المخزون</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              handleChange('stock', val);
              handleChange('inventory', val);
            }}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discount">الخصم (%)</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) => handleChange('discount', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="flex items-center gap-2 pt-8">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => handleChange('featured', checked)}
          />
          <Label htmlFor="featured">منتج مميز</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>صور المنتج</Label>
        <ImageUploader
          value={[formData.main_image, ...(formData.images || [])].filter(Boolean) as string[]}
          onChange={(urls) => {
            if (urls.length > 0) {
              handleChange('main_image', urls[0]);
              handleChange('images', urls.slice(1));
            } else {
              handleChange('main_image', '');
              handleChange('images', []);
            }
          }}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'جاري الحفظ...' : initialData ? 'تحديث المنتج' : 'إضافة المنتج'}
        </Button>
      </div>
    </form>
  );
};
