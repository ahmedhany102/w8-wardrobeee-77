
import React from "react";

interface ProductSizeButtonProps {
  size: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

const ProductSizeButton: React.FC<ProductSizeButtonProps> = ({
  size,
  selected,
  disabled,
  onSelect,
}) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    className={`px-2 py-1 rounded text-xs font-semibold border transition
      ${selected ? "bg-green-600 text-white border-green-700" : "bg-gray-100 text-gray-700 border-gray-300"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-green-700"}`}
  >
    {size}
  </button>
);

export default ProductSizeButton;
