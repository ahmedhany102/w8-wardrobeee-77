
import React, { useState, useEffect } from "react";
import { Product, SizeWithStock } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CategorySelector from "./CategorySelector";

interface ColorVariation {
  colorName: string;
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
  allowSizesWithoutColors?: boolean;
  predefinedCategories?: string[];
  predefinedTypes?: string[];
}

const ImprovedProductForm = ({
  initialData = {}, 
  onSubmit, 
  submitLabel = "حفظ المنتج", 
  onCancel, 
  allowSizesWithoutColors,
  predefinedCategories,
  predefinedTypes
}: ProductFormProps) => {
  // Basic product information
  const [name, setName] = useState(initialData.name || "");
  const [categoryId, setCategoryId] = useState(initialData.category_id || "");
  const [details, setDetails] = useState(initialData.details || initialData.description || "");
  const [mainImage, setMainImage] = useState(initialData.main_image || initialData.image_url || "");
  
  // Discount information
  const [hasDiscount, setHasDiscount] = useState(initialData.hasDiscount || false);
  const [discount, setDiscount] = useState(initialData.discount || 0);
  
  // Color variations
  const [colorVariations, setColorVariations] = useState<ColorVariation[]>([]);
  const [hasColorVariations, setHasColorVariations] = useState(false);
  
  // Simple product (no variations)
  const [simpleProductPrice, setSimpleProductPrice] = useState(initialData.price || 0);
  const [simpleProductStock, setSimpleProductStock] = useState(initialData.inventory || 0);
  
  // Validation state
  const [error, setError] = useState<string>("");

  // Initialize colorVariations from initialData if available
  useEffect(() => {
    if (initialData.colors && Array.isArray(initialData.colors) && initialData.colors.length > 0) {
      const variations: ColorVariation[] = [];
      
      initialData.colors.forEach(colorName => {
        // Filter sizes for this color (in this initial version, we don't have color-specific sizes)
        // so we'll just assign all sizes to all colors
        const colorSizes = initialData.sizes ? 
          initialData.sizes.map(s => ({
            size: s.size,
            price: s.price,
            stock: s.stock
          })) : [];
          
        variations.push({
          colorName,
          image: initialData.main_image || "",
          sizes: colorSizes
        });
      });
      
      setColorVariations(variations);
      setHasColorVariations(variations.length > 0);
    }
  }, [initialData]);

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

  // Add a new color variation
  const addColorVariation = () => {
    setColorVariations([...colorVariations, { 
      colorName: "", 
      image: "",
      sizes: []
    }]);
  };

  // Remove a color variation
  const removeColorVariation = (index: number) => {
    setColorVariations(colorVariations.filter((_, i) => i !== index));
  };

  // Update a color variation
  const updateColorVariation = (index: number, field: keyof ColorVariation, value: any) => {
    const updated = [...colorVariations];
    updated[index] = { ...updated[index], [field]: value };
    setColorVariations(updated);
  };

  // Handle color image upload
  const handleColorImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateColorVariation(index, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new size to a color variation
  const addSizeToColor = (colorIndex: number) => {
    const updated = [...colorVariations];
    updated[colorIndex].sizes.push({
      size: "",
      price: 0,
      stock: 0
    });
    setColorVariations(updated);
  };

  // Remove a size from a color variation
  const removeSizeFromColor = (colorIndex: number, sizeIndex: number) => {
    const updated = [...colorVariations];
    updated[colorIndex].sizes = updated[colorIndex].sizes.filter((_, i) => i !== sizeIndex);
    setColorVariations(updated);
  };

  // Update a size in a color variation
  const updateSizeInColor = (colorIndex: number, sizeIndex: number, field: string, value: any) => {
    const updated = [...colorVariations];
    updated[colorIndex].sizes[sizeIndex] = {
      ...updated[colorIndex].sizes[sizeIndex],
      [field]: field === 'size' ? value : Number(value)
    };
    setColorVariations(updated);
  };

  // Form validation
  const validateForm = () => {
    // Basic validation
    if (!name.trim()) return "يرجى إدخال اسم المنتج";
    if (categoryId === "") return "يرجى اختيار القسم";
    if (!mainImage) return "يرجى تحميل صورة رئيسية للمنتج";
    
    // Validate based on product type (simple vs. with variations)
    if (hasColorVariations) {
      // With variations
      if (colorVariations.length === 0) return "يرجى إضافة لون واحد على الأقل";
      
      for (let i = 0; i < colorVariations.length; i++) {
        const color = colorVariations[i];
        if (!color.colorName.trim()) return "يرجى إدخال اسم لكل لون";
        if (!color.image) return `يرجى تحميل صورة للون: ${color.colorName || `#${i+1}`}`;
        
        if (color.sizes.length === 0) return `يرجى إضافة مقاس واحد على الأقل للون: ${color.colorName}`;
        
        for (let j = 0; j < color.sizes.length; j++) {
          const size = color.sizes[j];
          if (!size.size.trim()) return `يرجى إدخال اسم المقاس للون: ${color.colorName}`;
          if (size.price <= 0) return `يرجى إدخال سعر صحيح للمقاس: ${size.size} من اللون: ${color.colorName}`;
          if (size.stock < 0) return `يرجى إدخال كمية صالحة للمقاس: ${size.size} من اللون: ${color.colorName}`;
        }
      }
    } else {
      // Simple product
      if (simpleProductPrice <= 0) return "يرجى إدخال سعر صحيح للمنتج";
      if (simpleProductStock < 0) return "يرجى إدخال كمية صالحة للمنتج";
    }
    
    return "";
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }
    
    // Format data for submission
    let formattedSizes: SizeWithStock[] = [];
    let formattedColors: string[] = [];
    let mainImageUrl = mainImage;
    
    if (hasColorVariations) {
      // Process variations
      formattedColors = colorVariations.map(color => color.colorName);
      
      // If no main image is set, use the first color's image
      if (!mainImage && colorVariations.length > 0 && colorVariations[0].image) {
        mainImageUrl = colorVariations[0].image;
      }
      
      // Collect all sizes from all color variations
      colorVariations.forEach(color => {
        color.sizes.forEach(size => {
          formattedSizes.push({
            size: size.size,
            price: size.price,
            stock: size.stock
          });
        });
      });
    } else {
      // Simple product
      formattedSizes = [{
        size: "standard",
        price: simpleProductPrice,
        stock: simpleProductStock
      }];
    }
    
    // Calculate inventory as sum of all sizes stock
    const calculatedInventory = formattedSizes.reduce((sum, item) => sum + item.stock, 0);
    
    // Clear error
    setError("");
    
    // Create the final product object - ONLY include fields that exist in the database
    const productData: any = {
      name: name.trim(),
      category_id: categoryId,
      description: details,
      discount: hasDiscount ? discount : 0,
      main_image: mainImageUrl,
      image_url: mainImageUrl, // Keep both for compatibility
      images: [mainImageUrl], // Store as array
      colors: hasColorVariations ? formattedColors : [], // Store as array
      sizes: formattedSizes, // Store as array
      price: formattedSizes.length > 0 ? formattedSizes[0].price : 0,
      inventory: calculatedInventory,
      stock: calculatedInventory,
      featured: false // Default value
    };
    
    console.log('🎯 Submitting product data:', productData);
    
    // Submit the product
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto p-4">
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
          
          <div className="space-y-4">
            <CategorySelector value={categoryId} onChange={setCategoryId} />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
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
        <div className="mt-4">
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
      </div>

      {/* Product Type Selection */}
      <div className="border-b pb-4 mb-4">
        <h3 className="text-lg font-bold mb-4">نوع المنتج</h3>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={!hasColorVariations}
              onChange={() => setHasColorVariations(false)}
              className="mr-2"
            />
            منتج بسيط (بدون ألوان)
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              checked={hasColorVariations}
              onChange={() => setHasColorVariations(true)}
              className="mr-2"
            />
            منتج بعدة ألوان
          </label>
        </div>
        
        {!hasColorVariations ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">السعر*</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={simpleProductPrice}
                onChange={e => setSimpleProductPrice(Number(e.target.value))}
                className="w-full p-2 border rounded text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">الكمية المتوفرة*</label>
              <input
                type="number"
                min="0"
                value={simpleProductStock}
                onChange={e => setSimpleProductStock(Number(e.target.value))}
                className="w-full p-2 border rounded text-sm"
                required
              />
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">الألوان والمقاسات المتوفرة</h4>
              <Button
                type="button"
                onClick={addColorVariation}
                className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2"
              >
                + إضافة لون جديد
              </Button>
            </div>
            
            {colorVariations.map((color, colorIndex) => (
              <div key={colorIndex} className="border rounded-md p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">لون #{colorIndex + 1}</h5>
                  <Button
                    type="button"
                    onClick={() => removeColorVariation(colorIndex)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2"
                  >
                    حذف اللون
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">اسم اللون*</label>
                    <input
                      type="text"
                      value={color.colorName}
                      onChange={e => updateColorVariation(colorIndex, "colorName", e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="مثل: أحمر، أزرق، إلخ"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">صورة اللون*</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleColorImageUpload(colorIndex, e)}
                      className="w-full p-2 border rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {color.image && (
                      <div className="mt-1">
                        <img src={color.image} alt={color.colorName} className="h-16 w-16 object-cover rounded" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between items-center">
                    <h6 className="text-sm font-medium">المقاسات المتوفرة لهذا اللون</h6>
                    <Button
                      type="button"
                      onClick={() => addSizeToColor(colorIndex)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2"
                    >
                      + إضافة مقاس
                    </Button>
                  </div>
                  
                  {color.sizes.length === 0 ? (
                    <p className="text-gray-500 text-sm mt-2">لا يوجد مقاسات بعد. أضف مقاس جديد.</p>
                  ) : (
                    <div className="mt-2">
                      <div className="grid grid-cols-4 gap-1 font-medium text-xs mb-1 bg-gray-100 p-1 rounded">
                        <div>المقاس</div>
                        <div>السعر</div>
                        <div>الكمية</div>
                        <div></div>
                      </div>
                      {color.sizes.map((size, sizeIndex) => (
                        <div key={sizeIndex} className="grid grid-cols-4 gap-1 mb-1 items-center border-b pb-1">
                          <input
                            type="text"
                            value={size.size}
                            onChange={e => updateSizeInColor(colorIndex, sizeIndex, "size", e.target.value)}
                            className="p-1 border rounded text-sm"
                            placeholder="مثل: S, M, L"
                            required
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={size.price}
                            onChange={e => updateSizeInColor(colorIndex, sizeIndex, "price", e.target.value)}
                            className="p-1 border rounded text-sm"
                            required
                          />
                          <input
                            type="number"
                            min="0"
                            value={size.stock}
                            onChange={e => updateSizeInColor(colorIndex, sizeIndex, "stock", e.target.value)}
                            className="p-1 border rounded text-sm"
                            required
                          />
                          <Button
                            type="button"
                            onClick={() => removeSizeFromColor(colorIndex, sizeIndex)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1"
                          >
                            حذف
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount */}
      <div className="border-b pb-4 mb-4">
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {/* Submit Buttons */}
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
