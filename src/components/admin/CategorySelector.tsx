
import React from "react";
import { useCategories } from "@/hooks/useCategories";

interface CategorySelectorProps {
  value: string | null;
  onChange: (categoryId: string) => void;
}
const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const { mainCategories, subcategories, categories, loading } = useCategories();

  // For now, only "Men" and its subcategories
  const men = mainCategories.find(c => c.slug === "men");
  const menSubcats = men ? subcategories(men.id) : [];

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Category</label>
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="w-full p-2 border rounded text-sm"
        required
      >
        <option value="">Select a subcategory</option>
        {menSubcats.map((sub) => (
          <option key={sub.id} value={sub.id}>{sub.name}</option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelector;
