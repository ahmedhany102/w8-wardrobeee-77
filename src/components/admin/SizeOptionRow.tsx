
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { ColorVariantOption } from '@/types/colorVariant';

interface SizeOptionRowProps {
  option: ColorVariantOption;
  optionIndex: number;
  onOptionChange: (optionIndex: number, field: keyof ColorVariantOption, value: any) => void;
  onRemoveOption: (optionIndex: number) => void;
}

const SizeOptionRow: React.FC<SizeOptionRowProps> = ({
  option,
  optionIndex,
  onOptionChange,
  onRemoveOption
}) => {
  const handleOptionChange = (field: keyof ColorVariantOption, value: any) => {
    // Convert string values to appropriate types
    let convertedValue = value;
    if (field === 'price') {
      convertedValue = parseFloat(value) || 0;
    } else if (field === 'stock') {
      convertedValue = parseInt(value) || 0;
    }
    onOptionChange(optionIndex, field, convertedValue);
  };

  return (
    <div className="grid grid-cols-5 gap-2 items-center p-2 border rounded">
      <Input
        value={option.size}
        onChange={(e) => handleOptionChange('size', e.target.value)}
        placeholder="S, M, L"
        size="sm"
        required
      />
      <Input
        type="number"
        value={option.price?.toString() || '0'}
        onChange={(e) => handleOptionChange('price', parseFloat(e.target.value) || 0)}
        placeholder="السعر"
        min="0"
        step="0.01"
        size="sm"
        required
      />
      <Input
        type="number"
        value={option.stock?.toString() || '0'}
        onChange={(e) => handleOptionChange('stock', parseInt(e.target.value) || 0)}
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
        onClick={() => onRemoveOption(optionIndex)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default SizeOptionRow;
