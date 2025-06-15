
import React, { useState, useEffect } from "react";
import { Product, SizeWithStock } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CategorySelector from "./CategorySelector";

// New internal type for color variant input structure
interface ColorVariantInput {
  color: string;
  image: string;
  sizes: {
    size: string;
    price: number;
    stock: number;
  }[];
}

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (product: Omit<Product, "id">) => void;
  submitLabel?: string;
  onCancel?: () => void;
  predefinedCategories?: string[];
}

const ImprovedProductForm = ({
  initialData = {}, 
  onSubmit, 
  submitLabel = "حفظ المنتج", 
  onCancel,
}: ProductFormProps) => {
  // main info
  const [name, setName] = useState(initialData.name || "");
  const [categoryId, setCategoryId] = useState(initialData.category_id || "");
  const [desc, setDesc] = useState(initialData.details || initialData.description || "");
  const [mainImage, setMainImage] = useState(initialData.main_image || initialData.image_url || "");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [hasDiscount, setHasDiscount] = useState(initialData.discount ? true : false);
  const [discount, setDiscount] = useState(initialData.discount || 0);
  // color variants
  const [colorVariants, setColorVariants] = useState<ColorVariantInput[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // If there's initial color variant data, initialize for edit
    if (Array.isArray(initialData.colors) && initialData.colors.length > 0 && initialData.sizes) {
      setColorVariants(
        initialData.colors.map((color, idx) => ({
          color,
          image: "", // Only way to set existing images is by extra mapping, skip for now
          sizes: initialData.sizes
            .filter(
              (s: any) => s.color === color || (!s.color && initialData.colors.length === 1)
            )
            .map((s: any) => ({
              size: s.size,
              price: s.price,
              stock: s.stock,
            })),
        }))
      );
    }
    if (initialData.images && Array.isArray(initialData.images)) {
      let mainImg = initialData.main_image || initialData.image_url;
      setGalleryImages(
        initialData.images.filter((img: string) => img !== mainImg)
      );
    }
  }, [initialData]);

  // File upload helpers
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMainImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          setGalleryImages((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };
  const removeGalleryImage = (idx: number) => setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  // Color variant management
  const addColorVariant = () => setColorVariants([...colorVariants, { color: "", image: "", sizes: [] }]);
  const removeColorVariant = (idx: number) => setColorVariants(colorVariants.filter((_, i) => i !== idx));
  const updateColorVariant = (idx: number, field: "color" | "image", value: string) => {
    setColorVariants(variants => {
      const copy = [...variants];
      copy[idx][field] = value;
      return copy;
    });
  };
  const handleColorImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateColorVariant(idx, "image", reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  // Size per color
  const addSizeToColor = (colorIdx: number) => {
    setColorVariants(vars => {
      const copy = [...vars];
      copy[colorIdx].sizes.push({ size: "", price: 0, stock: 0 });
      return copy;
    });
  };
  const removeSizeFromColor = (colorIdx: number, sizeIdx: number) => {
    setColorVariants(vars => {
      const copy = [...vars];
      copy[colorIdx].sizes = copy[colorIdx].sizes.filter((_, i) => i !== sizeIdx);
      return copy;
    });
  };
  const updateSizeInColor = (colorIdx: number, sizeIdx: number, field: string, value: any) => {
    setColorVariants(vars => {
      const copy = [...vars];
      copy[colorIdx].sizes[sizeIdx] = {
        ...copy[colorIdx].sizes[sizeIdx],
        [field]: field === "size" ? value : Number(value),
      };
      return copy;
    });
  };

  // Validation
  const validateForm = () => {
    if (!name.trim()) return "يرجى إدخال اسم المنتج";
    if (!categoryId || categoryId === "") return "يرجى اختيار القسم بشكل صحيح";
    if (!mainImage) return "يرجى تحميل صورة رئيسية";
    if (colorVariants.length < 1) return "يجب إضافة لون واحد على الأقل";
    for (let i = 0; i < colorVariants.length; i++) {
      const c = colorVariants[i];
      if (!c.color.trim()) return `يرجى إدخال اسم لكل لون (صف رقم ${i + 1})`;
      if (!c.image) return `يرجى تحميل صورة للون ${c.color}`;
      if (!c.sizes || c.sizes.length === 0)
        return `يرجى إضافة مقاس واحد على الأقل للون ${c.color}`;
      for (let j = 0; j < c.sizes.length; j++) {
        const s = c.sizes[j];
        if (!s.size.trim()) return `يرجى إدخال اسم المقاس للون ${c.color}`;
        if (s.price <= 0) return `السعر غير صحيح للون ${c.color} - المقاس ${s.size}`;
        if (s.stock < 0) return `الكمية لا يمكن أن تكون سالبة (${c.color} - ${s.size})`;
      }
    }
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    const err = validateForm();
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }

    // Prepare final images and save format
    let images: string[] = [mainImage, ...galleryImages];
    // Add any missing color images
    colorVariants.forEach(v => {
      if (v.image && !images.includes(v.image)) images.push(v.image);
    });

    // Inventory sum
    const inventory = colorVariants.reduce((total, v) =>
      total + v.sizes.reduce((s, x) => s + x.stock, 0)
    , 0);

    // Compose submit object for backend
    onSubmit({
      name: name.trim(),
      category_id: categoryId,
      description: desc,
      discount: hasDiscount ? discount : 0,
      main_image: mainImage,
      image_url: mainImage,
      images,
      colors: colorVariants.map(v => v.color),
      sizes: colorVariants.flatMap(v =>
        v.sizes.map(s => ({
          ...s, color: v.color
        }))
      ),
      price: colorVariants[0]?.sizes?.[0]?.price || 0,
      inventory,
      stock: inventory,
      featured: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto p-4">
      {/* Main info */}
      <div className="border-b pb-4 mb-4">
        <h3 className="text-lg font-bold mb-4">معلومات المنتج الأساسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المنتج*</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border rounded text-sm"
              required
            />
          </div>
          <div>
            <CategorySelector 
              value={categoryId}
              onChange={id => setCategoryId(id)}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">الوصف*</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            rows={4}
            required
            placeholder="وصف تفصيلي للمنتج..."
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">صورة المنتج الرئيسية*</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleMainImageUpload}
            className="w-full p-2 border rounded text-sm"
          />
          {mainImage && (
            <div className="mt-2">
              <div className="relative inline-block">
                <img src={mainImage} alt="main product" className="h-20 w-20 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => setMainImage("")}
                  className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-600 text-white rounded-full p-1 text-xs"
                >
                  X
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Gallery images */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">صور إضافية (المعرض)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryImageUpload}
            className="w-full p-2 border rounded text-sm"
          />
          {galleryImages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative inline-block">
                  <img src={img} alt={`gallery ${idx + 1}`} className="h-16 w-16 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-600 text-white rounded-full p-1 text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Color variants */}
      <div className="border-b pb-4 mb-4">
        <h3 className="text-lg font-bold mb-4">الألوان والمقاسات المتوفرة</h3>
        <Button type="button" onClick={addColorVariant} className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 mb-4">
          + إضافة لون جديد
        </Button>
        {colorVariants.map((variant, idx) => (
          <div key={idx} className="border rounded p-3 mb-2">
            <div className="flex justify-between items-center gap-3 mb-2">
              <input
                type="text"
                value={variant.color}
                onChange={e => updateColorVariant(idx, "color", e.target.value)}
                className="p-2 border rounded text-sm"
                placeholder="اسم اللون (مثال: أحمر)"
                required
              />
              <Button type="button" onClick={() => removeColorVariant(idx)} className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2">حذف اللون</Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">صورة اللون*</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleColorImageUpload(idx, e)}
                className="w-full p-2 border rounded text-sm"
              />
              {variant.image && (
                <div className="mt-1">
                  <img src={variant.image} alt={variant.color} className="h-16 w-16 object-cover rounded" />
                </div>
              )}
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">المقاسات لهذا اللون</span>
                <Button type="button" onClick={() => addSizeToColor(idx)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2">+ إضافة مقاس</Button>
              </div>
              {variant.sizes.length === 0 ? (
                <div className="text-gray-400 text-xs">لا يوجد مقاسات بعد.</div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 gap-2 mb-1 font-bold text-xs bg-gray-100 p-1 rounded">
                    <div>المقاس</div>
                    <div>السعر</div>
                    <div>الكمية</div>
                    <div></div>
                  </div>
                  {variant.sizes.map((sz, sidx) => (
                    <div className="grid grid-cols-4 gap-2 items-center mb-1" key={sidx}>
                      <input
                        type="text"
                        value={sz.size}
                        onChange={e => updateSizeInColor(idx, sidx, "size", e.target.value)}
                        className="p-1 border rounded text-xs"
                        placeholder="مثل: S, M, L"
                        required
                      />
                      <input
                        type="number"
                        value={sz.price}
                        min="0"
                        onChange={e => updateSizeInColor(idx, sidx, "price", e.target.value)}
                        className="p-1 border rounded text-xs"
                        required
                      />
                      <input
                        type="number"
                        value={sz.stock}
                        min="0"
                        onChange={e => updateSizeInColor(idx, sidx, "stock", e.target.value)}
                        className="p-1 border rounded text-xs"
                        required
                      />
                      <Button type="button" onClick={() => removeSizeFromColor(idx, sidx)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1">حذف</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Discount */}
      <div className="border-b pb-4 mb-4">
        <input
          type="checkbox"
          checked={hasDiscount}
          onChange={e => setHasDiscount(e.target.checked)}
          id="hasDiscount"
          className="w-4 h-4"
        />
        <label htmlFor="hasDiscount" className="text-sm font-medium ml-2">منتج عليه خصم</label>
        {hasDiscount && (
          <input
            type="number"
            min="1"
            max="100"
            value={discount}
            onChange={e => setDiscount(parseInt(e.target.value) || 0)}
            className="w-20 p-2 border rounded text-sm ml-2"
            placeholder="نسبة الخصم %"
          />
        )}
      </div>
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">{error}</div>}
      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded font-bold text-sm"
          >
            إلغاء
          </Button>
        )}
        <Button
          type="submit"
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded font-bold text-sm"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ImprovedProductForm;
