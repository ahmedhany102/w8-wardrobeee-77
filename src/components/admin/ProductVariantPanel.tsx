
import React, { useEffect, useState } from "react";
import { useProductVariants, ProductVariant } from "@/hooks/useProductVariants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  productId: string;
}

const ProductVariantPanel: React.FC<Props> = ({ productId }) => {
  const { variants, fetchVariants, addVariant, updateVariant, deleteVariant, loading } = useProductVariants(productId);
  const [form, setForm] = useState<Omit<ProductVariant, "id"|"product_id">>({
    color: "",
    size: "",
    image_url: "",
    price: 0,
    stock: 0
  });

  useEffect(() => { fetchVariants(); }, [productId]);

  const handleAdd = () => {
    if (!form.color || !form.size || !form.image_url) return;
    addVariant({ ...form, product_id: productId });
    setForm({ color: "", size: "", image_url: "", price: 0, stock: 0 });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold mb-2">Product Variants</h3>
      <div className="flex gap-2 flex-wrap">
        <Input placeholder="Color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
        <Input placeholder="Size" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
        <Input placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
        <Input type="number" placeholder="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
        <Input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
        <Button onClick={handleAdd}>Add</Button>
      </div>
      <div>
        {loading ? "Loading..." : (
          <table className="w-full border mt-2 text-sm">
            <thead>
              <tr>
                <th>Color</th>
                <th>Size</th>
                <th>Image</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(v => (
                <tr key={v.id}>
                  <td>{v.color}</td>
                  <td>{v.size}</td>
                  <td><img src={v.image_url} className="h-8 w-8" /></td>
                  <td>{v.price}</td>
                  <td>{v.stock}</td>
                  <td>
                    <Button size="sm" variant="destructive" onClick={() => deleteVariant(v.id!)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductVariantPanel;
