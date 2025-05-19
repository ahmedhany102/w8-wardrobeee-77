
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
  
  // Convert from SizeWithStock to SizeItem for the form
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

  // Set up color-specific image handling
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
    
    // Convert sizes from SizeItem format to SizeWithStock format
    const formattedSizes: SizeWithStock[] = sizes.map(sizeItem => {
      return {
        size: sizeItem.size,
        price: sizeItem.price,
        stock: sizeItem.stock
      };
    });
    
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
      description: '',
      price: formattedSizes.length > 0 ? formattedSizes[0].price : 0,
      inventory: formattedSizes.reduce((sum, item) => sum + item.stock, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <form className="space-y-6 w-full max-w-2xl mx-auto" onSubmit={handleSubmit}>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="flex flex-col w-full">
          <label className="block font-bold mb-1">اسم المنتج *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="block font-bold mb-1">القسم *</label>
          <select
            value={categoryPath.join(" > ")}
            onChange={e => {
              const selectedPath = e.target.value.split(" > ");
              setCategoryPath(selectedPath);
            }}
            className="border rounded px-3 py-2 w-full"
            required
          >
            {availableCategories.map(path => (
              <option key={path.join("-")} value={path.join(" > ")}>
                {path.join(" > ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-full">
          <label className="block font-bold mb-1">النوع *</label>
          <input
            type="text"
            value={type}
            onChange={e => setType(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="مثال: تشيرت، قميص، بنطلون، فستان، حذاء..."
            required
          />
        </div>
        <div className="flex flex-col w-full">
          <label className="block font-bold mb-1 mb-2">الألوان المتوفرة</label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'أحمر', code: '#ff0000' },
              { name: 'أزرق', code: '#0074D9' },
              { name: 'أسود', code: '#111111' },
              { name: 'أبيض', code: '#ffffff', border: true },
              { name: 'أخضر', code: '#2ECC40' },
              { name: 'أصفر', code: '#FFDC00' },
              { name: 'رمادي', code: '#AAAAAA' },
              { name: 'وردي', code: '#FF69B4' },
              { name: 'بنفسجي', code: '#B10DC9' },
              { name: 'بني', code: '#8B4513' },
            ].map(color => (
              <button
                type="button"
                key={color.code}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center focus:outline-none ${colors.includes(color.name) ? 'ring-2 ring-green-600 border-green-600' : 'border-gray-300'} ${color.border ? 'border' : ''}`}
                style={{ background: color.code }}
                title={color.name}
                onClick={() => setColors(colors.includes(color.name) ? colors.filter(c => c !== color.name) : [...colors, color.name])}
              >
                {colors.includes(color.name) && <span className="text-xs text-white font-bold">✓</span>}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">اضغط لاختيار لون أو أكثر</div>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <label className="block font-bold mb-1">تفاصيل إضافية</label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          rows={2}
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="block font-bold mb-1">صور المنتج *</label>
        <ImageUploader value={images} onChange={setImages} label={undefined} />
      </div>
      
      {/* Color-specific images section */}
      {colors.length > 0 && (
        <div className="flex flex-col w-full border p-4 rounded bg-gray-50">
          <label className="block font-bold mb-3">صور خاصة بكل لون</label>
          <div className="space-y-4">
            {colors.map(color => (
              <div key={color} className="flex flex-col md:flex-row items-start md:items-center gap-2 border-b pb-4">
                <div className="font-medium min-w-[100px]">{color}</div>
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          handleColorImageChange(color, event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-sm text-gray-800"
                  />
                </div>
                {colorImages.find(ci => ci.color === color)?.imageUrl && (
                  <div className="w-12 h-12 overflow-hidden rounded border">
                    <img 
                      src={colorImages.find(ci => ci.color === color)?.imageUrl} 
                      alt={`${color} preview`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto w-full">
        <SizeManager sizes={sizes} onChange={setSizes} />
      </div>
      <div className="flex items-center gap-2 w-full">
        <input
          type="checkbox"
          checked={hasDiscount}
          onChange={e => setHasDiscount(e.target.checked)}
          id="hasDiscount"
        />
        <label htmlFor="hasDiscount">منتج عليه خصم</label>
        {hasDiscount && (
          <input
            type="number"
            min={1}
            max={100}
            value={discount}
            onChange={e => setDiscount(parseInt(e.target.value) || 0)}
            className="border rounded px-2 py-1 w-20 ml-2"
            placeholder="نسبة الخصم %"
          />
        )}
      </div>
      <button
        type="submit"
        className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded font-bold w-full"
      >
        {submitLabel}
      </button>
    </form>
  );
};

export default ProductForm;
