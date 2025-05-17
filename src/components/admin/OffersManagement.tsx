import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Product } from "@/models/Product";

interface Offer {
  id: string;
  title: string;
  discount: number;
  products: string[];
  active: boolean;
}

const OffersManagement: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState<Omit<Offer, "id">>({
    title: "",
    discount: 10,
    products: [],
    active: true,
  });

  useEffect(() => {
    const storedOffers = localStorage.getItem("offers");
    setOffers(storedOffers ? JSON.parse(storedOffers) : []);
    const storedProducts = localStorage.getItem("products");
    setProducts(storedProducts ? JSON.parse(storedProducts) : []);
  }, []);

  const openAddDialog = () => {
    setEditingOffer(null);
    setForm({ title: "", discount: 10, products: [], active: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (offer: Offer) => {
    setEditingOffer(offer);
    setForm({
      title: offer.title,
      discount: offer.discount,
      products: offer.products,
      active: offer.active,
    });
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === "products") {
      setForm((prev: typeof form) => ({
        ...prev,
        products: checked
          ? [...prev.products, value]
          : prev.products.filter((id: string) => id !== value),
      }));
    } else if (type === "checkbox") {
      setForm((prev: typeof form) => ({ ...prev, [name]: checked }));
    } else if (name === "discount") {
      setForm((prev: typeof form) => ({ ...prev, discount: Number(value) }));
    } else {
      setForm((prev: typeof form) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (!form.title || form.discount <= 0 || form.products.length === 0) {
      toast.error("Please fill all fields and select at least one product.");
      return;
    }
    let updatedOffers: Offer[];
    if (editingOffer) {
      updatedOffers = offers.map((o: Offer) =>
        o.id === editingOffer.id ? { ...editingOffer, ...form } : o
      );
      toast.success("Offer updated");
    } else {
      const newOffer: Offer = {
        id: `offer-${Date.now()}`,
        ...form,
      };
      updatedOffers = [...offers, newOffer];
      toast.success("Offer added");
    }
    setOffers(updatedOffers);
    localStorage.setItem("offers", JSON.stringify(updatedOffers));
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const updatedOffers = offers.filter((o: Offer) => o.id !== id);
    setOffers(updatedOffers);
    localStorage.setItem("offers", JSON.stringify(updatedOffers));
    toast.success("Offer deleted");
  };

  return (
    <CardContent className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-800">Offers Management</h2>
        <Button onClick={openAddDialog} className="bg-green-700 hover:bg-green-800 text-white">
          Add Offer
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Discount (%)</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-400">
                No offers found
              </TableCell>
            </TableRow>
          ) : (
            offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>{offer.title}</TableCell>
                <TableCell>{offer.discount}</TableCell>
                <TableCell>{offer.products.length}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${offer.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                    {offer.active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button className="px-3 py-1 text-sm border" onClick={() => openEditDialog(offer)}>
                    Edit
                  </Button>
                  <Button className="ml-2 text-red-600 px-3 py-1 text-sm border" onClick={() => handleDelete(offer.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOffer ? "Edit Offer" : "Add Offer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleFormChange} />
            </div>
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input id="discount" name="discount" type="number" min={1} max={100} value={form.discount} onChange={handleFormChange} />
            </div>
            <div>
              <Label>Products</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="products"
                      value={product.id}
                      checked={form.products.includes(product.id)}
                      onChange={handleFormChange}
                    />
                    <span>{product.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="active">Active</Label>
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleFormChange}
                className="ml-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="px-4 py-2 border" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-700 hover:bg-green-800 text-white px-4 py-2" onClick={handleSubmit}>
              {editingOffer ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
};

export default OffersManagement;
