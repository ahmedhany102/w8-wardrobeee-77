
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { ColorVariant, ColorVariantOption } from '@/types/colorVariant';
import ColorVariantCard from './ColorVariantCard';

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
          <ColorVariantCard
            key={variantIndex}
            variant={variant}
            variantIndex={variantIndex}
            onVariantChange={handleVariantChange}
            onOptionChange={handleOptionChange}
            onRemoveVariant={removeVariant}
            onAddOption={addOption}
            onRemoveOption={removeOption}
          />
        ))
      )}
    </div>
  );
};

export default ProductColorVariantManager;
