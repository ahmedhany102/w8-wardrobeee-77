
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { ColorVariant, ColorVariantOption } from '@/types/colorVariant';
import SizeOptionRow from './SizeOptionRow';

interface ColorVariantCardProps {
  variant: ColorVariant;
  variantIndex: number;
  onVariantChange: (index: number, field: keyof ColorVariant, value: any) => void;
  onOptionChange: (variantIndex: number, optionIndex: number, field: keyof ColorVariantOption, value: any) => void;
  onRemoveVariant: (index: number) => void;
  onAddOption: (variantIndex: number) => void;
  onRemoveOption: (variantIndex: number, optionIndex: number) => void;
}

const ColorVariantCard: React.FC<ColorVariantCardProps> = ({
  variant,
  variantIndex,
  onVariantChange,
  onOptionChange,
  onRemoveVariant,
  onAddOption,
  onRemoveOption
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onVariantChange(variantIndex, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (optionIndex: number, field: keyof ColorVariantOption, value: any) => {
    onOptionChange(variantIndex, optionIndex, field, value);
  };

  const handleRemoveOption = (optionIndex: number) => {
    onRemoveOption(variantIndex, optionIndex);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">لون #{variantIndex + 1}</CardTitle>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onRemoveVariant(variantIndex)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color Name and Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>اسم اللون *</Label>
            <Input
              value={variant.color}
              onChange={(e) => onVariantChange(variantIndex, 'color', e.target.value)}
              placeholder="مثال: أحمر، أزرق، أسود"
              required
            />
          </div>
          <div>
            <Label>صورة اللون *</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
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
              onClick={() => onAddOption(variantIndex)}
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
                <SizeOptionRow
                  key={optionIndex}
                  option={option}
                  optionIndex={optionIndex}
                  onOptionChange={handleOptionChange}
                  onRemoveOption={handleRemoveOption}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorVariantCard;
