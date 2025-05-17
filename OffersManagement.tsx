import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

interface Offer {
  id: string;
  title: string;
  discount: number;
  active: boolean;
}

const OffersManagement: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<Omit<Offer, "id">>({
    title: "",
    discount: 10,
    active: true,
  });

  useEffect(() => {
    const storedOffers = localStorage.getItem("offers");
    setOffers(storedOffers ? JSON.parse(storedOffers) : []);
  }, []);

  const openAddDialog = () => {
    setForm({ title: "", discount: 10, active: true });
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "discount") {
      setForm((prev) => ({ ...prev, discount: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (!form.title || form.discount <= 0) {
      toast.error("Please fill all fields.");
      return;
    }
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      ...form,
    };
    const updatedOffers = [...offers, newOffer];
    setOffers(updatedOffers);
    localStorage.setItem("offers", JSON.stringify(updatedOffers));
    setIsDialogOpen(false);
    toast.success("Offer added");
  };

  const handleDelete = (id: string) => {
    const updatedOffers = offers.filter((o) => o.id !== id);
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
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-400">
                No offers found
              </TableCell>
            </TableRow>
          ) : (
            offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>{offer.title}</TableCell>
                <TableCell>{offer.discount}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${offer.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                    {offer.active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
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
            <DialogTitle>Add Offer</DialogTitle>
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
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
};

export default OffersManagement; 