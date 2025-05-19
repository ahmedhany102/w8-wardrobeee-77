import React, { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import SizeManager, { SizeItem } from "./SizeManager";
import { Product, SizeWithStock, ColorImage } from "@/models/Product";

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (product: Omit<Product, "id">) => void;
  submitLabel?: string;
}

// Define available categories with nested structure
const categoryStructure = {
  "رجالي": {
    "أحذية": null,
    "ملابس": {
      "تيشيرتات": null,
      "بناطيل": null,
    }
  },
  "حريمي": {
    "فساتين": null,
    "بلوزات": null,
    "أحذية": null,
  },
  "أطفال": {
    "أولاد": {
      "تيشيرتات": null,
      "بناطيل": null,
      "أحذية": null,
    },
    "بنات": {
      "فساتين": null,
      "تيشيرتات": null,
      "أحذية": null,
    }
  }
};

// Convert nested categories to flat paths for select dropdown
const flattenCategories = (obj: any, prefix: string[] = []): string[][] => {
  return Object.entries(obj || {}).flatMap(([key, value]) => {
    const path = [...prefix, key];
    return value === null 
      ? [path] 
      : [path, ...flattenCategories(value, path)];
  });
};

const availableCategories = flattenCategories(categoryStructure);

const ProductForm: React.FC<ProductFormProps> = ({ initialData = {}, onSubmit, submitLabel = "حفظ المنتج" }) => {
  const [name, setName] = useState(initialData.name || "");
  const [categoryPath, setCategoryPath] = useState<string[]>(initialData.categoryPath || ["رجالي"]);
  const [type, setType] = useState(initialData.type || "");
  const [colors, setColors] = useState<string[]>(initialData.colors || []);
  const [details, setDetails] = useState(initialData.details || "");
  const [hasDiscount, setHasDiscount] = useState(initialData.hasDiscount || false);
  const [discount, setDiscount] = useState(initialData.discount || 0);
  const [images, setImages] = useState<string[]>(initialData.mainImage ? [initialData.mainImage] : (initialData.images || []));
  const [colorImages, setColorImages] = useState<ColorImage[]>(initialData.colorImages || []);
  const [sizes, setSizes] = useState<SizeItem[]>(
    initialData.sizes 
      ? initialData.sizes.map(s => ({ 
          size: s.size,
          price: s.price,
          stock: s.stock,
          image: ""
        })) 
      : []
  );
  
  const [error, setError] = useState<string>("");

  const handleColorImageChange = (color: string, imageUrl: string) => {
    const existingIndex = colorImages.findIndex(ci => ci.color === color);
    if (existingIndex >= 0) {
      const updated = [...colorImages];
      updated[existingIndex] = { color, imageUrl };
      setColorImages(updated);
    } else {
      setColorImages([...colorImages, { color, imageUrl }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !type.trim() || categoryPath.length === 0 || sizes.length === 0 || images.length === 0) {
      setError("يرجى ملء جميع الحقول المطلوبة (الاسم، القسم، النوع، صورة، المقاسات)");
      return;
    }
    
    const formattedSizes: SizeWithStock[] = sizes.map(sizeItem => ({
      size: sizeItem.size,
      price: sizeItem.price,
      stock: sizeItem.stock
    }));
    
    setError("");
    onSubmit({
      name: name.trim(),
      category: categoryPath[0] as Product["category"],
      categoryPath,
      type: type.trim(),
      colors,
      colorImages,
      details,
      hasDiscount,
      discount: hasDiscount ? discount : 0,
      mainImage: images[0],
      images,
      sizes: formattedSizes,
      description: details,
      price: formattedSizes.length > 0 ? formattedSizes[0].price : 0,
      inventory: formattedSizes.reduce((sum, item) => sum + item.stock, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto p-4">
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
          <label className="block text-sm font-medium mb-1">القسم*</label>
          <select
            value={categoryPath[0]}
            onChange={e => setCategoryPath([e.target.value])}
            className="w-full p-2 border rounded text-sm"
            required
          >
            {Object.keys(categoryStructure).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">النوع*</label>
          <input
            type="text"
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الفئة الفرعية</label>
          <select
            value={categoryPath[1] || ""}
            onChange={e => setCategoryPath([categoryPath[0], e.target.value])}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">اختر الفئة الفرعية</option>
            {categoryStructure[categoryPath[0]] && 
              Object.keys(categoryStructure[categoryPath[0]]).map(subCategory => (
                <option key={subCategory} value={subCategory}>{subCategory}</option>
              ))
            }
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الوصف*</label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الصور*</label>
        <div className="space-y-2">
          {images.map((image, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={image}
                onChange={e => {
                  const newImages = [...images];
                  newImages[index] = e.target.value;
                  setImages(newImages);
                }}
                className="flex-1 p-2 border rounded text-sm"
                placeholder="رابط الصورة"
                required
              />
              <button
                type="button"
                onClick={() => {
                  const newImages = images.filter((_, i) => i !== index);
                  setImages(newImages);
                }}
                className="text-red-600 hover:text-red-700"
              >
                حذف
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setImages([...images, ''])}
            className="text-green-600 hover:text-green-700"
          >
            إضافة صورة
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">الألوان المتاحة*</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={color}
                onChange={e => {
                  const newColors = [...colors];
                  newColors[index] = e.target.value;
                  setColors(newColors);
                }}
                className="p-2 border rounded text-sm"
                placeholder="اسم اللون"
              />
              <input
                type="text"
                value={colorImages.find(ci => ci.color === color)?.imageUrl || ''}
                onChange={e => handleColorImageChange(color, e.target.value)}
                className="p-2 border rounded text-sm"
                placeholder="رابط صورة اللون"
              />
              <button
                type="button"
                onClick={() => {
                  const newColors = colors.filter((_, i) => i !== index);
                  setColors(newColors);
                  setColorImages(colorImages.filter(ci => ci.color !== color));
                }}
                className="text-red-600 hover:text-red-700"
              >
                حذف
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setColors([...colors, ''])}
            className="text-green-600 hover:text-green-700"
          >
            إضافة لون
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">المقاسات المتاحة*</label>
        <div className="overflow-x-auto">
          <SizeManager sizes={sizes} onChange={setSizes} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hasDiscount}
          onChange={e => setHasDiscount(e.target.checked)}
          id="hasDiscount"
          className="w-4 h-4"
        />
        <label htmlFor="hasDiscount" className="text-sm font-medium">منتج عليه خصم</label>
        {hasDiscount && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={discount}
              onChange={e => setDiscount(parseInt(e.target.value) || 0)}
              className="w-20 p-2 border rounded text-sm"
              placeholder="نسبة الخصم %"
            />
            <span className="text-sm">%</span>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        className="w-full bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded font-bold text-sm"
      >
        {submitLabel}
      </button>
    </form>
  );
};

export default ProductForm;
