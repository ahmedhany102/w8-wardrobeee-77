
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ColorVariantOption {
  id?: string;
  size: string;
  price: number;
  stock: number;
}

interface ColorVariant {
  id?: string;
  color: string;
  image: string | null;
  options: ColorVariantOption[];
}

interface ProductColorVariantManagerProps {
  variants: ColorVariant[];
  onChange: (variants: ColorVariant[]) => void;
  productId?: string;
}

const ProductColorVariantManager: React.FC<ProductColorVariantManagerProps> = ({
  variants,
  onChange,
  productId
}) => {
  const [localVariants, setLocalVariants] = useState<ColorVariant[]>(variants);

  useEffect(() => {
    setLocalVariants(variants);
  }, [variants]);

  const handleVariantChange = (index: number, field: keyof ColorVariant, value: any) => {
    const updatedVariants = [...localVariants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setLocalVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const handleOptionChange = (variantIndex: number, optionIndex: number, field: keyof ColorVariantOption, value: any) => {
    const updatedVariants = [...localVariants];
    const updatedOptions = [...updatedVariants[variantIndex].options];
    
    // Handle type conversion for numeric fields
    let convertedValue = value;
    if (field === 'price') {
      convertedValue = parseFloat(value) || 0;
    } else if (field === 'stock') {
      convertedValue = parseInt(value) || 0;
    }
    
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: convertedValue };
    updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], options: updatedOptions };
    setLocalVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const addVariant = () => {
    const newVariant: ColorVariant = {
      color: '',
      image: null,
      options: []
    };
    const updatedVariants = [...localVariants, newVariant];
    setLocalVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = localVariants.filter((_, i) => i !== index);
    setLocalVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const addOption = (variantIndex: number) => {
    const newOption: ColorVariantOption = {
      size: '',
      price: 0,
      stock: 0
    };
    const updatedVariants = [...localVariants];
    updatedVariants[variantIndex].options.push(newOption);
    setLocalVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const removeOption = (variantIndex: number, optionIndex: number) => {
    const updatedVariants = [...localVariants];
    updatedVariants[variantIndex].options = updatedVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
    setLocalVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const handleImageUpload = (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleVariantChange(variantIndex, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">إدارة ألوان المنتج</h3>
        <Button type="button" onClick={addVariant} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          إضافة لون جديد
        </Button>
      </div>

      {localVariants.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <p>لا توجد ألوان محددة. أضف لون جديد للبدء.</p>
          </CardContent>
        </Card>
      ) : (
        localVariants.map((variant, variantIndex) => (
          <Card key={variantIndex} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">لون #{variantIndex + 1}</CardTitle>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeVariant(variantIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>اسم اللون *</Label>
                  <Input
                    value={variant.color}
                    onChange={(e) => handleVariantChange(variantIndex, 'color', e.target.value)}
                    placeholder="مثال: أحمر، أزرق، أسود"
                    required
                  />
                </div>
                <div>
                  <Label>صورة اللون *</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(variantIndex, e)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
                  />
                  {variant.image && (
                    <div className="mt-2">
                      <img src={variant.image} alt={variant.color} className="h-16 w-16 object-cover rounded border" />
                    </div>
                  )}
                </div>
              </div>

              {/* Size Options */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">المقاسات والأسعار</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addOption(variantIndex)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    إضافة مقاس
                  </Button>
                </div>

                {variant.options.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 border border-dashed rounded">
                    لا توجد مقاسات. أضف مقاس للبدء.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded">
                      <div>المقاس</div>
                      <div>السعر</div>
                      <div>الكمية</div>
                      <div>الحالة</div>
                      <div>إجراء</div>
                    </div>
                    {variant.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="grid grid-cols-5 gap-2 items-center p-2 border rounded">
                        <Input
                          value={option.size}
                          onChange={(e) => handleOptionChange(variantIndex, optionIndex, 'size', e.target.value)}
                          placeholder="S, M, L"
                          size="sm"
                          required
                        />
                        <Input
                          type="number"
                          value={option.price.toString()}
                          onChange={(e) => handleOptionChange(variantIndex, optionIndex, 'price', e.target.value)}
                          placeholder="السعر"
                          min="0"
                          step="0.01"
                          size="sm"
                          required
                        />
                        <Input
                          type="number"
                          value={option.stock.toString()}
                          onChange={(e) => handleOptionChange(variantIndex, optionIndex, 'stock', e.target.value)}
                          placeholder="الكمية"
                          min="0"
                          size="sm"
                          required
                        />
                        <Badge className={option.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {option.stock > 0 ? "متوفر" : "نفذ"}
                        </Badge>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeOption(variantIndex, optionIndex)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ProductColorVariantManager;
