import React, { useEffect, useState } from "react";
import { useProductVariants, ProductColorVariant, ProductColorVariantOption } from "@/hooks/useProductVariants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  productId: string;
}

const ProductVariantPanel: React.FC<Props> = ({ productId }) => {
  const { variants, fetchVariants, addVariant, updateVariant, deleteVariant, updateOption, deleteOption, loading } = useProductVariants(productId);

  // For adding a new color variant
  const [form, setForm] = useState<{ color: string; image: string | null; options: { size: string; price: number; stock: number }[] }>({
    color: "",
    image: "",
    options: [],
  });
  // For adding one option inline for new color
  const [newOption, setNewOption] = useState<{ size: string; price: number; stock: number }>({ size: "", price: 0, stock: 0 });

  useEffect(() => { fetchVariants(); }, [productId]);

  const handleAddOption = () => {
    if (!newOption.size) return;
    setForm(prev => ({ ...prev, options: [...(prev.options || []), { ...newOption }] }));
    setNewOption({ size: "", price: 0, stock: 0 });
  };

  const handleRemoveOption = (index: number) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddColorVariant = () => {
    if (!form.color || !form.options.length) return;
    addVariant(form);
    setForm({ color: "", image: "", options: [] });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold mb-2">Product Variants</h3>
      <div className="flex gap-2 flex-wrap">
        {/* Color/name */}
        <Input placeholder="Color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
        {/* Color image */}
        <Input placeholder="Image URL" value={form.image || ""} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
        
        {/* Option adder */}
        <Input placeholder="Size" value={newOption.size} onChange={e => setNewOption(n => ({ ...n, size: e.target.value }))} />
        <Input type="number" placeholder="Price" value={newOption.price} onChange={e => setNewOption(n => ({ ...n, price: Number(e.target.value) }))} />
        <Input type="number" placeholder="Stock" value={newOption.stock} onChange={e => setNewOption(n => ({ ...n, stock: Number(e.target.value) }))} />
        <Button type="button" onClick={handleAddOption}>+ Size</Button>
        <Button type="button" onClick={handleAddColorVariant}>Add Color Variant</Button>
      </div>
      {/* Option list for new color */}
      <div className="mb-2">
        {form.options.map((o, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span>{o.size}</span>
            <span>{o.price}</span>
            <span>{o.stock}</span>
            <Button size="sm" variant="destructive" type="button" onClick={() => handleRemoveOption(idx)}>Del</Button>
          </div>
        ))}
      </div>

      <div>
        {loading ? "Loading..." : (
          <table className="w-full border mt-2 text-sm">
            <thead>
              <tr>
                <th>Color</th>
                <th>Image</th>
                <th>Size</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(v => (
                v.options?.length ? v.options.map((opt, idx) => (
                  <tr key={opt.id || idx}>
                    {/* color-rowspan */}
                    {idx === 0 ? <td rowSpan={v.options.length}>{v.color}</td> : null}
                    {idx === 0 ? <td rowSpan={v.options.length}>
                      {v.image && <img src={v.image} className="h-8 w-8" />}
                    </td> : null}
                    <td>{opt.size}</td>
                    <td>{opt.price}</td>
                    <td>{opt.stock}</td>
                    <td>
                      <Button size="sm" variant="destructive" type="button" onClick={() => deleteOption(opt.id!)}>Delete</Button>
                    </td>
                  </tr>
                )) : (
                  <tr key={v.id}>
                    <td>{v.color}</td>
                    <td>{v.image && <img src={v.image} className="h-8 w-8" />}</td>
                    <td colSpan={4}>No sizes</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductVariantPanel;
