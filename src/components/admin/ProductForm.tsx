import React, { useState, useEffect, useRef } from "react";
// import ImageUploader from "./ImageUploader"; // Removed as we will implement directly or use standard input
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
      "فساتير": null,
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

// Note: availableCategories might not be needed if using nested selects dynamically
// const availableCategories = flattenCategories(categoryStructure);

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
          price: s.price, // Assuming price is per size
          stock: s.stock,
          image: "" // Image per size might not be needed based on schema, clarify?
        })) 
      : []
  );
  
  const [error, setError] = useState<string>("");

  // Handle main image file upload
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([reader.result as string]); // Assuming only one main image for now
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle color image file upload
  const handleColorImageUpload = (colorIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && colors[colorIndex]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedColorImages = [...colorImages];
        const existingIndex = updatedColorImages.findIndex(ci => ci.color === colors[colorIndex]);
        if (existingIndex >= 0) {
          updatedColorImages[existingIndex].imageUrl = reader.result as string;
        } else {
          updatedColorImages.push({ color: colors[colorIndex], imageUrl: reader.result as string });
        }
        setColorImages(updatedColorImages);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle color name change
  const handleColorNameChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
    // Also update colorImages if the color name changes
    const updatedColorImages = colorImages.map(ci => ci.color === colors[index] ? { ...ci, color: value } : ci);
    setColorImages(updatedColorImages);
  };

  const addColor = () => {
    setColors([...colors, '']);
  };

  const removeColor = (index: number) => {
    const colorToRemove = colors[index];
    setColors(colors.filter((_, i) => i !== index));
    setColorImages(colorImages.filter(ci => ci.color !== colorToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation check
    if (!name.trim() || !type.trim() || categoryPath.length === 0 || sizes.length === 0 || images.length === 0 || colors.length === 0) {
       setError("يرجى ملء جميع الحقول المطلوبة (الاسم، القسم، النوع، صورة المنتج الرئيسية، الألوان، المقاسات)");
       return;
    }
     // Basic check for color names and images
     if (colors.some(color => !color.trim()) || (colors.length > 0 && colorImages.length < colors.length)) {
       setError("يرجى إدخال اسم لكل لون وتحميل صورة لكل لون مضاف.");
       return;
     }

    const formattedSizes: SizeWithStock[] = sizes.map(sizeItem => ({
      size: sizeItem.size,
      price: sizeItem.price,
      stock: sizeItem.stock
    }));
    
    setError(""); // Clear error on successful validation
    
    // Construct the product object to be submitted
    onSubmit({
      name: name.trim(),
      category: categoryPath[categoryPath.length - 1] as Product["category"], // Use the last part of categoryPath
      categoryPath,
      type: type.trim(),
      colors,
      colorImages,
      details,
      hasDiscount,
      discount: hasDiscount ? discount : 0,
      mainImage: images[0], // Assuming the first uploaded image is the main one
      images, // Include all uploaded images
      sizes: formattedSizes,
      description: details, // Use details as description
      price: formattedSizes.length > 0 ? formattedSizes[0].price : 0, // Assuming base price is from the first size, or clarify?
      inventory: formattedSizes.reduce((sum, item) => sum + item.stock, 0),
      createdAt: initialData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Function to render nested category selects
  const renderCategorySelects = (structure: any, currentPath: string[]): JSX.Element[] => {
    const level = currentPath.length;
    const currentLevelOptions = level === 0 ? Object.keys(structure) : Object.keys(structure[currentPath[level - 1]] || {});

    if (currentLevelOptions.length === 0) return [];

    const nextLevelStructure = structure[currentPath[level]];

    return [
      <div key={`category-select-${level}`}>
        <label className="block text-sm font-medium mb-1">{level === 0 ? "القسم الرئيسي*" : `الفئة الفرعية ${level}`}</label>
        <select
          value={currentPath[level] || ""}
          onChange={e => {
            const newPath = currentPath.slice(0, level);
            newPath[level] = e.target.value;
            setCategoryPath(newPath);
          }}
          className="w-full p-2 border rounded text-sm"
          required={level === 0} // Only the main category is strictly required
        >
          <option value="">{level === 0 ? "اختر القسم الرئيسي" : "اختر فئة فرعية"}</option>
          {currentLevelOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>,
      ...(currentPath[level] && nextLevelStructure !== null ? renderCategorySelects(structure[currentPath[level]], currentPath.slice(0, level + 1)) : []) // Recursive call for next level
    ];
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto p-4">
      {/* Product Details */}
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
         {/* Dynamic Category Selects */}
         {renderCategorySelects(categoryStructure, categoryPath)}
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
        {/* Placeholder for other potential 2-column fields */}
        <div></div> 
      </div>

      {/* Description */}
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

      {/* Main Images Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">صور المنتج الرئيسية*</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleMainImageUpload}
          className="w-full p-2 border rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          // required // Make required if at least one image is mandatory
        />
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                 <img src={image} alt="main product" className="h-20 w-20 object-cover rounded" />
                 <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                    className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                 >
                    X
                 </button>
              </div>
            ))}
          </div>
        )}
         {/* Option to add more main images if needed, similar to colors */}
         {/* For now, assuming only one main image handled by the file input */}
      </div>

      {/* Color and Color Images */}
      <div>
        <label className="block text-sm font-medium mb-1">الألوان وصور الألوان المتاحة*</label>
        <div className="space-y-4">
          {colors.map((color, index) => (
            <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 border rounded-md">
              <div className="flex-1 w-full md:w-auto">
                 <label className="block text-sm font-medium mb-1">اسم اللون</label>
                 <input
                   type="text"
                   value={color}
                   onChange={e => handleColorNameChange(index, e.target.value)}
                   className="w-full p-2 border rounded text-sm"
                   placeholder="اسم اللون (مثال: أحمر)"
                   required
                 />
              </div>
               <div className="flex-1 w-full md:w-auto">
                  <label className="block text-sm font-medium mb-1">صورة اللون</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleColorImageUpload(index, e)}
                    className="w-full p-2 border rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    required // Make required if image per color is mandatory
                  />
                  {colorImages.find(ci => ci.color === color)?.imageUrl && (
                    <img
                       src={colorImages.find(ci => ci.color === color)?.imageUrl}
                       alt={`Image for ${color}`}
                       className="h-16 w-16 object-cover rounded mt-2"
                    />
                  )}
               </div>
              
              <button
                type="button"
                onClick={() => removeColor(index)}
                className="mt-2 md:mt-auto text-red-600 hover:text-red-700 self-end md:self-center"
              >
                حذف اللون
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addColor}
            className="text-green-600 hover:text-green-700 text-sm font-semibold"
          >
            + إضافة لون جديد
          </button>
        </div>
      </div>

      {/* Sizes Management */}
      <div>
        <label className="block text-sm font-medium mb-1">المقاسات المتاحة*</label>
        <div className="overflow-x-auto">
          <SizeManager sizes={sizes} onChange={setSizes} />
        </div>
      </div>

      {/* Discount */}
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

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {/* Submit Button */}
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
