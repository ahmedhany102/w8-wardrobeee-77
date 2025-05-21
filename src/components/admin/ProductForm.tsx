
import React, { useState, useEffect } from "react";
import SizeManager, { SizeItem } from "./SizeManager";
import { Product, SizeWithStock } from "@/models/Product";

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (product: Omit<Product, "id">) => void;
  submitLabel?: string;
}

// Type for color image for internal use in form
interface ColorImageInternal {
  color: string;
  imageUrl: string;
}

// Define available categories with nested structure
const categoryStructure = {
  "رجالي": {
    "أحذية": null,
    "تيشيرتات": null,
    "بناطيل": null
  },
  "حريمي": {
    "فساتين": null,
    "أحذية": null,
    "بلوزات": null
  },
  "أطفال": {
    "أولاد": {
      "تيشيرتات": null,
      "بناطيل": null,
      "أحذية": null
    },
    "بنات": {
      "فساتين": null,
      "تيشيرتات": null, 
      "أحذية": null
    }
  }
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData = {}, onSubmit, submitLabel = "حفظ المنتج" }) => {
  const [name, setName] = useState(initialData.name || "");
  const [categoryPath, setCategoryPath] = useState<string[]>(initialData.categoryPath || []);
  const [type, setType] = useState(initialData.type || "");
  const [colors, setColors] = useState<string[]>(initialData.colors || []);
  const [details, setDetails] = useState(initialData.details || "");
  const [hasDiscount, setHasDiscount] = useState(initialData.hasDiscount || false);
  const [discount, setDiscount] = useState(initialData.discount || 0);
  const [mainImage, setMainImage] = useState(initialData.mainImage || "");
  const [additionalImages, setAdditionalImages] = useState<string[]>(initialData.images || []);
  const [colorImages, setColorImages] = useState<ColorImageInternal[]>([]);
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
  
  // Initialize colorImages from initialData if available
  useEffect(() => {
    if (initialData.colorImages && initialData.colors) {
      const colorImagesArray: ColorImageInternal[] = [];
      
      initialData.colors.forEach(color => {
        // Get images for this color
        const images = initialData.colorImages?.[color];
        if (images && images.length > 0) {
          colorImagesArray.push({
            color,
            imageUrl: images[0] // Use the first image
          });
        }
      });
      
      setColorImages(colorImagesArray);
    }
  }, [initialData]);
  
  const [error, setError] = useState<string>("");

  // Handle main image file upload
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

  // Handle additional images upload
  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (indexToRemove: number) => {
    setAdditionalImages(additionalImages.filter((_, index) => index !== indexToRemove));
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
    const oldColor = newColors[index];
    newColors[index] = value;
    setColors(newColors);
    
    // Update colorImages if the color name changes
    const updatedColorImages = colorImages.map(ci => ci.color === oldColor ? { ...ci, color: value } : ci);
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
    if (!name.trim() || categoryPath.length === 0 || !type.trim() || (!mainImage && additionalImages.length === 0) || colors.length === 0 || sizes.length === 0) {
      setError("يرجى ملء جميع الحقول المطلوبة (الاسم، القسم، النوع، صور المنتج، الألوان، المقاسات)");
      return;
    }
    
    // Basic check for color names and images
    if (colors.some(color => !color.trim())) {
      setError("يرجى إدخال اسم لكل لون");
      return;
    }
    
    // Check that each color has a corresponding image
    if (colors.some(color => !colorImages.find(ci => ci.color === color))) {
      setError("يرجى تحميل صورة لكل لون مضاف");
      return;
    }

    const formattedSizes: SizeWithStock[] = sizes.map(sizeItem => ({
      size: sizeItem.size,
      price: sizeItem.price,
      stock: sizeItem.stock
    }));
    
    setError(""); // Clear error on successful validation
    
    // Combine all images
    const allImages = [...additionalImages];
    if (mainImage) {
      allImages.unshift(mainImage);
    }
    
    // Convert colorImages array to Record<string, string[]>
    const formattedColorImages: Record<string, string[]> = {};
    colorImages.forEach(ci => {
      formattedColorImages[ci.color] = [ci.imageUrl];
    });
    
    // Construct the product object to be submitted
    onSubmit({
      name: name.trim(),
      category: categoryPath[categoryPath.length - 1] || "", // Use the last part of categoryPath
      categoryPath,
      type: type.trim(),
      colors,
      colorImages: formattedColorImages,
      details,
      hasDiscount,
      discount: hasDiscount ? discount : 0,
      mainImage: mainImage || additionalImages[0] || "", // Use the first image as main if no main image was uploaded
      images: allImages,
      sizes: formattedSizes,
      description: details, // Use details as description
      price: formattedSizes.length > 0 ? formattedSizes[0].price : 0, // Use first size price as base price
      inventory: formattedSizes.reduce((sum, item) => sum + item.stock, 0),
      createdAt: initialData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Get current level options for category selection
  const getCategoryOptions = (path: string[] = [], level: number = 0) => {
    let current = categoryStructure;
    
    // Traverse the path to get to the current level
    for (let i = 0; i < level; i++) {
      if (!path[i] || !current[path[i]]) {
        return [];
      }
      current = current[path[i]];
    }
    
    if (current === null) return [];
    return Object.keys(current);
  };

  // Render category selectors based on the current path
  const renderCategorySelectors = () => {
    const selectors = [];
    
    // First level (main categories)
    const mainCategories = getCategoryOptions();
    selectors.push(
      <div key="level-0" className="mb-4">
        <label className="block text-sm font-medium mb-1">القسم الرئيسي*</label>
        <select
          value={categoryPath[0] || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              setCategoryPath([value]);
            } else {
              setCategoryPath([]);
            }
          }}
          className="w-full p-2 border rounded text-sm"
          required
        >
          <option value="">اختر القسم الرئيسي</option>
          {mainCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    );
    
    // Render subcategory selectors if a main category is selected
    if (categoryPath[0]) {
      const subCategories = getCategoryOptions(categoryPath, 1);
      selectors.push(
        <div key="level-1" className="mb-4">
          <label className="block text-sm font-medium mb-1">القسم الفرعي*</label>
          <select
            value={categoryPath[1] || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                setCategoryPath([categoryPath[0], value]);
              } else {
                setCategoryPath([categoryPath[0]]);
              }
            }}
            className="w-full p-2 border rounded text-sm"
            required
          >
            <option value="">اختر القسم الفرعي</option>
            {subCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      );
    }
    
    // Render third level if applicable (e.g., for Kids > Boys > T-shirts)
    if (categoryPath[0] === "أطفال" && categoryPath[1]) {
      const subSubCategories = getCategoryOptions(categoryPath, 2);
      if (subSubCategories.length > 0) {
        selectors.push(
          <div key="level-2" className="mb-4">
            <label className="block text-sm font-medium mb-1">النوع*</label>
            <select
              value={categoryPath[2] || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  setCategoryPath([categoryPath[0], categoryPath[1], value]);
                } else {
                  setCategoryPath([categoryPath[0], categoryPath[1]]);
                }
              }}
              className="w-full p-2 border rounded text-sm"
              required
            >
              <option value="">اختر النوع</option>
              {subSubCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        );
      }
    }
    
    return selectors;
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
        
        {/* Render dynamic category selectors */}
        <div className="space-y-4">
          {renderCategorySelectors()}
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
            placeholder="مثل: قميص كاجوال، بدلة رسمية، إلخ"
          />
        </div>
        <div></div> {/* Placeholder for layout */}
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
          placeholder="وصف تفصيلي للمنتج..."
        />
      </div>

      {/* Main Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">صورة المنتج الرئيسية*</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleMainImageUpload}
          className="w-full p-2 border rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
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

      {/* Additional Images Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">صور إضافية للمنتج</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdditionalImagesUpload}
          className="w-full p-2 border rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        {additionalImages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {additionalImages.map((image, index) => (
              <div key={index} className="relative group">
                <img src={image} alt={`product ${index + 1}`} className="h-20 w-20 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeAdditionalImage(index)}
                  className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Color and Color Images */}
      <div>
        <label className="block text-sm font-medium mb-1">الألوان وصور الألوان المتاحة*</label>
        <div className="space-y-4">
          {colors.map((color, index) => (
            <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 border rounded-md">
              <div className="flex-1 w-full md:w-auto">
                <label className="block text-sm font-medium mb-1">اسم اللون*</label>
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
                <label className="block text-sm font-medium mb-1">صورة اللون*</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleColorImageUpload(index, e)}
                  className="w-full p-2 border rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  required={!colorImages.find(ci => ci.color === color)}
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
