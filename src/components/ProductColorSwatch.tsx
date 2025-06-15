
import React from "react";

interface ProductColorSwatchProps {
  color: string;
  selected: boolean;
  onSelect: () => void;
  label?: string;
}

const ProductColorSwatch: React.FC<ProductColorSwatchProps> = ({
  color,
  selected,
  onSelect,
  label,
}) => (
  <button
    type="button"
    aria-label={label || color}
    title={label || color}
    onClick={onSelect}
    className={`w-7 h-7 rounded-full border-2 mr-1 transition hover:border-green-600 focus:outline-none
      ${selected ? "border-green-600 ring-2 ring-green-200" : "border-gray-300"}`}
    style={{
      backgroundColor: color,
      boxShadow: selected
        ? "0 0 0 3px rgba(22,163,74,0.2)"
        : undefined,
    }}
  />
);

export default ProductColorSwatch;
