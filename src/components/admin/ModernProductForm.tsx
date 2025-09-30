import React, { useState } from "react";
import { Product } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import CategorySelector from "./CategorySelector";
import { ProductVariantService } from "@/services/productVariantService";

// فقط متغير افتراضي واحد (لون+مقاس Default)
export const ModernProductForm: React.FC<{ initialData?: Partial<Product>; onSubmit: (product: Omit<Product, "id">, productIdHandler?: (productId: string) => Promise<boolean>) => void; submitLabel?: string; onCancel?: () => void; }> = ({
  initialData = {},
  onSubmit,
  submitLabel = "حفظ المنتج",
  onCancel
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [basePrice, setBasePrice] = useState(initialData.price || 0);
  const [category, setCategory] = useState(initialData.category_id || "");
  const [stock, setStock] = useState(initialData.stock || 0);
  const [mainImage, setMainImage] = useState(initialData.main_image || "");
  const [discount, setDiscount] = useState(initialData.discount || 0);
  const [hasDiscount, setHasDiscount] = useState(!!initialData.discount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMainImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // === الحفظ الفعلي: إدخال متغير افتراضي واحد مع صورة وسعر ومخزون خاصة بهذا المنتج ===
  const saveVariantsToDatabase = async (productId: string): Promise<boolean> => {
    const formattedVariants = [
      {
        color: "Default",
        image: mainImage,
        options: [{
          size: "Default",
          price: basePrice,
          stock: Number(stock) || 0
        }]
      }
    ];
    return await ProductVariantService.saveProductVariants(productId, formattedVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!name.trim() || !description.trim() || basePrice <= 0 || !category.trim() || !mainImage) {
        setError("يرجى تعبئة جميع الحقول الأساسية!");
        setLoading(false);
        return;
      }
      const productData: Omit<Product, "id"> = {
        name: name.trim(),
        description: description.trim(),
        price: basePrice,
        category_id: category,
        discount: hasDiscount ? discount : 0,
        main_image: mainImage,
        image_url: mainImage,
        stock: Number(stock) || 0,
        inventory: Number(stock) || 0,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
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
          {/* اسم المنتج */}
          <div>
            <Label htmlFor="name">اسم المنتج *</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          {/* وصف المنتج */}
          <div>
            <Label htmlFor="description">وصف المنتج *</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          {/* السعر والمخزون */}
          <div className="flex gap-4">
            <div>
              <Label htmlFor="basePrice">السعر *</Label>
              <Input id="basePrice" type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="stock">المخزون *</Label>
              <Input id="stock" type="number" value={stock} onChange={e => setStock(Number(e.target.value))} required />
            </div>
          </div>
          {/* الفئة */}
          <CategorySelector value={category} onChange={setCategory} />
          {/* صورة المنتج */}
          <div>
            <Label>الصورة الرئيسية *</Label>
            <div>
              <input type="file" accept="image/*" onChange={handleMainImageUpload} id="main-image-upload" className="hidden" />
              <label htmlFor="main-image-upload" className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                {mainImage ? <img src={mainImage} alt="Main product" className="h-full w-full object-cover rounded-lg" />
                 : <div className="text-center">اضغط لتحميل الصورة الرئيسية</div>}
              </label>
            </div>
          </div>
          {/* الحقول الأخرى */}
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
          <div className="flex gap-2">
            {onCancel && <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>إلغاء</Button>}
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? "جاري الحفظ..." : submitLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
