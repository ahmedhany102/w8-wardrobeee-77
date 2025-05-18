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
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
      <div>
        <label className="block font-bold mb-1">اسم المنتج *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
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
        <div>
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
      </div>
      <div>
        <label className="block font-bold mb-1">الألوان المتوفرة (افصل بينهم بفاصلة ,)</label>
        <input
          type="text"
          value={colors.join(", ")}
          onChange={e => setColors(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
          className="border rounded px-3 py-2 w-full"
          placeholder="مثال: أحمر, أزرق, أسود"
        />
      </div>
      <div>
        <label className="block font-bold mb-1">تفاصيل إضافية</label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          rows={2}
        />
      </div>
      <div>
        <label className="block font-bold mb-1">صور المنتج *</label>
        <ImageUploader value={images} onChange={setImages} label={undefined} />
      </div>
      <div>
        <SizeManager sizes={sizes} onChange={setSizes} />
      </div>
      <div className="flex items-center gap-2">
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
