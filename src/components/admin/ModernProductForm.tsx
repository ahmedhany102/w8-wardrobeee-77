import React, { useState, useEffect } from "react";
import { Product } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import CategorySelector from "./CategorySelector";
import { ProductVariantService } from "@/services/productVariantService";

interface ProductVariantInput {
  label: string;
  image_url: string;
  price_adjustment: number;
  stock: number;
  is_default: boolean;
}

interface ModernProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (product: Omit<Product, "id">, productIdHandler?: (productId: string) => Promise<boolean>) => void;
  submitLabel?: string;
  onCancel?: () => void;
}

export const ModernProductForm: React.FC<ModernProductFormProps> = ({
  initialData = {},
  onSubmit,
  submitLabel = "حفظ المنتج",
  onCancel
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [basePrice, setBasePrice] = useState(initialData.price || 0);
  const [category, setCategory] = useState(initialData.category_id || "");
  const [discount, setDiscount] = useState(initialData.discount || 0);
  const [hasDiscount, setHasDiscount] = useState(!!initialData.discount);
  const [mainImage, setMainImage] = useState(initialData.main_image || "");
  const [variants, setVariants] = useState<ProductVariantInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Variant CRUD
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        label: "",
        image_url: "",
        price_adjustment: 0,
        stock: 0,
        is_default: variants.length === 0 // First variant is default
      }
    ]);
  };
  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    // If we removed the default variant, make the first one default
    if (variants[index].is_default && newVariants.length > 0) {
      newVariants[0].is_default = true;
    }
    setVariants(newVariants);
  };
  const updateVariant = (index: number, field: keyof ProductVariantInput, value: any) => {
    const newVariants = [...variants];
    if (field === 'is_default' && value) {
      // Only one variant can be default
      newVariants.forEach((v, i) => v.is_default = i === index);
    } else {
      newVariants[index] = { ...newVariants[index], [field]: value };
    }
    setVariants(newVariants);
  };

  // Image uploaders
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleVariantImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newVariants = [...variants];
        newVariants[index].image_url = reader.result as string;
        setVariants(newVariants);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation
  const validateForm = () => {
    if (!name.trim()) {
      setError("اسم المنتج مطلوب");
      return false;
    }
    if (!description.trim()) {
      setError("وصف المنتج مطلوب");
      return false;
    }
    if (basePrice <= 0) {
      setError("السعر الأساسي مطلوب ويجب أن يكون أكبر من صفر");
      return false;
    }
    if (!category.trim()) {
      setError("التصنيف مطلوب");
      return false;
    }
    if (!mainImage) {
      setError("الصورة الرئيسية مطلوبة");
      return false;
    }
    if (variants.length === 0) {
      setError("يجب إضافة متغير واحد على الأقل (لون مع صورة)");
      return false;
    }
    for (const variant of variants) {
      if (!variant.label.trim()) {
        setError("جميع المتغيرات يجب أن تحتوي على اسم");
        return false;
      }
      if (!variant.image_url) {
        setError(`يجب تحميل صورة للمتغير: ${variant.label}`);
        return false;
      }
    }
    return true;
  };

  // The NEW CORRECT function for saving variants using productVariantService 
  const saveVariantsToDatabase = async (productId: string): Promise<boolean> => {
    // Map from admin state to the structure productVariantService expects
    // Here, we use only 1 size per variant, called "Default"
    const formattedVariants = variants.map(variant => ({
      color: variant.label,
      image: variant.image_url,
      options: [{
        size: "Default",
        price: variant.price_adjustment,
        stock: variant.stock
      }]
    }));
    return await ProductVariantService.saveProductVariants(productId, formattedVariants);
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    try {
      const productData: Omit<Product, "id"> = {
        name: name.trim(),
        description: description.trim(),
        price: basePrice,
        category_id: category,
        discount: hasDiscount ? discount : 0,
        main_image: mainImage,
        image_url: mainImage, // Ensure image_url is also set
        stock: variants.reduce((sum, v) => sum + v.stock, 0),
        inventory: variants.reduce((sum, v) => sum + v.stock, 0),
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      // SUBMIT: pass productData and the variant save handler
      onSubmit(productData, saveVariantsToDatabase);
    } catch (error) {
      setError("حدث خطأ أثناء حفظ المنتج");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>إدارة المنتج</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">اسم المنتج *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم المنتج"
                required
              />
            </div>
            <div>
              <CategorySelector
                value={category}
                onChange={(categoryId) => setCategory(categoryId)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">وصف المنتج *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف تفصيلي للمنتج"
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="basePrice">السعر الأساسي *</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasDiscount"
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
              />
              <Label htmlFor="hasDiscount">يوجد خصم</Label>
            </div>
            {hasDiscount && (
              <div>
                <Label htmlFor="discount">نسبة الخصم (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            )}
          </div>
          {/* Main Image */}
          <div>
            <Label>الصورة الرئيسية *</Label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="hidden"
                id="main-image-upload"
              />
              <label
                htmlFor="main-image-upload"
                className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400"
              >
                {mainImage ? (
                  <img src={mainImage} alt="Main product" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    اضغط لتحميل الصورة الرئيسية
                  </div>
                )}
              </label>
            </div>
          </div>
          {/* Color Variants */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">متغيرات المنتج (الألوان)</Label>
              <Button type="button" onClick={addVariant} size="sm">
                إضافة متغير
              </Button>
            </div>
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <Label>اسم اللون *</Label>
                      <Input
                        value={variant.label}
                        onChange={(e) => updateVariant(index, 'label', e.target.value)}
                        placeholder="مثل: أحمر، أزرق"
                        required
                      />
                    </div>
                    <div>
                      <Label>تعديل السعر</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={variant.price_adjustment}
                        onChange={(e) => updateVariant(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>المخزون</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={variant.is_default}
                        onChange={(e) => updateVariant(index, 'is_default', e.target.checked)}
                      />
                      <Label>افتراضي</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        إزالة
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>صورة المتغير *</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleVariantImageUpload(index, e)}
                        className="hidden"
                        id={`variant-image-${index}`}
                      />
                      <label
                        htmlFor={`variant-image-${index}`}
                        className="cursor-pointer flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400"
                      >
                        {variant.image_url ? (
                          <img src={variant.image_url} alt={variant.label} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            اضغط لتحميل صورة {variant.label || 'المتغير'}
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
                disabled={loading}
              >
                إلغاء
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "جاري الحفظ..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
