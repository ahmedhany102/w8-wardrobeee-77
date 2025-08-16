
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
  const { categories, loading } = useCategories();

  // Show all active categories (both main and subcategories)
  const allActiveCategories = categories.filter(cat => cat.is_active);

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
          console.log('🎯 Category selected via CategorySelector:', val);
          if (val && val !== "" && val !== "placeholder" && val !== "no-categories") {
            onChange(val);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent className="bg-white z-50 shadow-lg border">
          {allActiveCategories.length === 0 ? (
            <SelectItem value="no-categories" disabled>
              No categories available
            </SelectItem>
          ) : (
            allActiveCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.parent_id ? `→ ${category.name}` : category.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {allActiveCategories.length === 0 && !loading && (
        <p className="text-sm text-red-600 mt-1">No categories found. Please check your categories table.</p>
      )}
    </div>
  );
};

export default CategorySelector;
