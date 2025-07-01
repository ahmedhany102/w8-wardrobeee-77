
import React from "react";
import { useCategories } from "@/hooks/useCategories";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface CategorySelectorProps {
  value: string | null;
  onChange: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const { mainCategories, subcategories, loading } = useCategories();

  // Only show subcategories as options
  const validSubcategories = mainCategories
    .map(main => subcategories(main.id))
    .flat()
    .filter(sub => sub.is_active);

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <div className="w-full p-2 border rounded text-sm bg-gray-100">Loading categories...</div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Category*</label>
      <Select
        value={value || ""}
        onValueChange={(val) => {
          if (val && val !== "" && val !== "placeholder") {
            console.log('🎯 Category selected via CategorySelector:', val);
            onChange(val);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a subcategory" />
        </SelectTrigger>
        <SelectContent className="bg-white z-50 shadow-lg border">
          {validSubcategories.length === 0 ? (
            <SelectItem value="no-categories" disabled>
              No subcategories available
            </SelectItem>
          ) : (
            validSubcategories.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {validSubcategories.length === 0 && !loading && (
        <p className="text-sm text-red-600 mt-1">No subcategories found. Please check your categories table.</p>
      )}
    </div>
  );
};

export default CategorySelector;
