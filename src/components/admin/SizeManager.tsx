
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SizeWithStock } from "@/models/Product";

// Add this interface that was missing
export interface SizeItem {
  size: string;
  price: number;
  stock: number;
  image?: string;
}

export interface SizeManagerProps {
  sizes: SizeWithStock[];
  onChange: (sizes: SizeWithStock[]) => void;
  colors?: string[]; // Making colors optional to fix TypeScript error
}

const SizeManager: React.FC<SizeManagerProps> = ({ sizes, onChange, colors }) => {
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleAddSize = () => {
    if (!newSize.trim()) return;
    
    const sizeExists = sizes.some(s => s.size.toLowerCase() === newSize.toLowerCase());
    if (sizeExists) {
      alert("This size already exists");
      return;
    }
    
    const newSizeObj: SizeWithStock = {
      size: newSize,
      stock: parseInt(newStock) || 0,
      price: parseFloat(newPrice) || 0
    };
    
    onChange([...sizes, newSizeObj]);
    setNewSize("");
    setNewStock("");
    setNewPrice("");
  };
  
  const handleUpdateSize = (index: number, field: keyof SizeWithStock, value: string) => {
    const updatedSizes = [...sizes];
    
    if (field === 'size') {
      updatedSizes[index][field] = value;
    } else {
      // For 'stock' and 'price' fields, convert to number
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        updatedSizes[index][field] = field === 'stock' ? Math.floor(numValue) : numValue;
      }
    }
    
    onChange(updatedSizes);
  };
  
  const handleRemoveSize = (index: number) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    onChange(updatedSizes);
  };

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 font-medium">
            <div className="col-span-3">Size</div>
            <div className="col-span-3">Price (EGP)</div>
            <div className="col-span-3">Stock</div>
            <div className="col-span-3">Actions</div>
          </div>
          
          {sizes.map((size, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3">
                <Input
                  value={size.size}
                  onChange={(e) => handleUpdateSize(index, 'size', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={size.price}
                  onChange={(e) => handleUpdateSize(index, 'price', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={size.stock}
                  onChange={(e) => handleUpdateSize(index, 'stock', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveSize(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="border-t pt-4">
        <Label>Add New Size</Label>
        <div className="grid grid-cols-12 gap-2 mt-2">
          <div className="col-span-3">
            <Input
              placeholder="Size"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="col-span-3">
            <Input
              placeholder="Price"
              type="number"
              min="0"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="col-span-3">
            <Input
              placeholder="Stock"
              type="number"
              min="0"
              step="1"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="col-span-3">
            <Button 
              type="button"
              onClick={handleAddSize}
              className="w-full"
            >
              Add Size
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeManager;
