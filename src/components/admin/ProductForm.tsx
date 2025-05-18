import React, { useState } from "react";
import ImageUploader from "./ImageUploader";
import SizeManager, { SizeItem } from "./SizeManager";
import { Product } from "@/models/Product";

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (product: Omit<Product, "id">) => void;
  submitLabel?: string;
}

const categories = ["رجالي", "حريمي", "أطفال"];

const ProductForm: React.FC<ProductFormProps> = ({ initialData = {}, onSubmit, submitLabel = "حفظ المنتج" }) => {
  const [name, setName] = useState(initialData.name || "");
  const [category, setCategory] = useState(initialData.category || "رجالي");
  const [type, setType] = useState(initialData.type || "");
  const [colors, setColors] = useState<string[]>(initialData.colors || []);
  const [details, setDetails] = useState(initialData.details || "");
  const [hasDiscount, setHasDiscount] = useState(initialData.hasDiscount || false);
  const [discount, setDiscount] = useState(initialData.discount || 0);
  const [images, setImages] = useState<string[]>(initialData.mainImage ? [initialData.mainImage] : (initialData.images || []));
  const [sizes, setSizes] = useState<SizeItem[]>(initialData.sizes || []);
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !type.trim() || !category || sizes.length === 0 || images.length === 0) {
      setError("يرجى ملء جميع الحقول المطلوبة (الاسم، القسم، النوع، صورة، المقاسات)");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim(),
      category: category as Product["category"],
      type: type.trim(),
      colors,
      details,
      hasDiscount,
      discount: hasDiscount ? discount : 0,
      mainImage: images[0],
      images,
      sizes,
    } as any);
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
            value={category}
            onChange={e => setCategory(e.target.value as "رجالي" | "حريمي" | "أطفال")}
            className="border rounded px-3 py-2 w-full"
            required
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
