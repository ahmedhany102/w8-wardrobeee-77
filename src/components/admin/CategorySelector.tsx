
import React from "react";
import { useCategories } from "@/hooks/useCategories";

interface CategorySelectorProps {
  value: string | null;
  onChange: (categoryId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const { mainCategories, subcategories, loading } = useCategories();

  // Get Men category and its subcategories
  const menCategory = mainCategories.find(c => c.slug === "men");
  // Only include subcategories with non-empty IDs!
  const menSubcategories = menCategory
    ? subcategories(menCategory.id).filter(sub => !!sub.id && sub.id !== "")
    : [];

  // If value is invalid or empty, default to "placeholder"
  const safeValue =
    value && value !== "" && value !== undefined && value !== null
      ? value
      : "placeholder";

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
      <select
        value={safeValue}
        onChange={e => {
          if (e.target.value !== "placeholder") {
            onChange(e.target.value);
          }
        }}
        className="w-full p-2 border rounded text-sm"
        required
      >
        <option value="placeholder" disabled>
          Select a subcategory
        </option>
        {menSubcategories.map((sub) =>
          (!!sub.id && sub.id !== "") ? (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ) : null
        )}
      </select>
      {menSubcategories.length === 0 && !loading && (
        <p className="text-sm text-red-600 mt-1">
          No subcategories found. Please check your categories table.
        </p>
      )}
    </div>
  );
};

export default CategorySelector;

