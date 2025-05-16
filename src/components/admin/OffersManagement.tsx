
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Product, ProductDatabase } from "@/models/Product";

interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  applicableProducts: string[]; // Product IDs
  active: boolean;
}

const OffersManagement = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  
  // New offer form state
  const [newOffer, setNewOffer] = useState<Omit<Offer, 'id'>>({
    title: "",
    description: "",
    discountPercentage: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    applicableProducts: [],
    active: true,
  });
  
  useEffect(() => {
    loadOffers();
    loadProducts();
  }, []);
  
  const loadOffers = () => {
    setIsLoading(true);
    const storedOffers = localStorage.getItem('offers');
    if (storedOffers) {
      try {
        const parsedOffers = JSON.parse(storedOffers);
        setOffers(parsedOffers);
      } catch (error) {
        console.error("Error parsing offers:", error);
        setOffers([]);
      }
    } else {
      setOffers([]);
    }
    setIsLoading(false);
  };
  
  const loadProducts = async () => {
    try {
      const productDb = ProductDatabase.getInstance();
      const allProducts = await productDb.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
  };
  
  const handleCreateOffer = () => {
    setEditingOffer(null);
    setNewOffer({
      title: "",
      description: "",
      discountPercentage: 10,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applicableProducts: [],
      active: true,
    });
    setIsDialogOpen(true);
  };
  
  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setNewOffer({
      title: offer.title,
      description: offer.description,
      discountPercentage: offer.discountPercentage,
      startDate: offer.startDate,
      endDate: offer.endDate,
      applicableProducts: [...offer.applicableProducts],
      active: offer.active,
    });
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOffer(prev => ({
      ...prev,
      [name]: name === 'discountPercentage' ? Number(value) : value
    }));
  };
  
  // Fix for the boolean value issue
  const handleSelectChange = (name: string, value: string) => {
    setNewOffer(prev => ({
      ...prev,
      [name]: name === 'active' ? (value === "active") : value
    }));
  };
  
  const handleProductSelectionChange = (productId: string, checked: boolean) => {
    setNewOffer(prev => ({
      ...prev,
      applicableProducts: checked 
        ? [...prev.applicableProducts, productId]
        : prev.applicableProducts.filter(id => id !== productId)
    }));
  };
  
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!newOffer.title || !newOffer.description) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (newOffer.discountPercentage <= 0 || newOffer.discountPercentage > 100) {
        toast.error("Discount percentage must be between 1 and 100");
        return;
      }
      
      if (new Date(newOffer.endDate) <= new Date(newOffer.startDate)) {
        toast.error("End date must be after start date");
        return;
      }
      
      if (newOffer.applicableProducts.length === 0) {
        toast.error("Please select at least one product");
        return;
      }

      let updatedOffers = [];
      
      if (editingOffer) {
        // Update existing offer
        updatedOffers = offers.map(offer => 
          offer.id === editingOffer.id ? { ...newOffer, id: editingOffer.id } : offer
        );
        toast.success("Offer updated successfully");
      } else {
        // Create new offer
        const newId = `offer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const offerToAdd = { ...newOffer, id: newId };
        updatedOffers = [...offers, offerToAdd];
        toast.success("Offer created successfully");
      }
      
      // Save offers to localStorage
      localStorage.setItem('offers', JSON.stringify(updatedOffers));
      setOffers(updatedOffers);
      
      // Apply discount to products
      await applyDiscountToProducts(newOffer);
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error("Failed to save offer");
    }
  };
  
  const applyDiscountToProducts = async (offer: Omit<Offer, 'id'>) => {
    try {
      const productDb = ProductDatabase.getInstance();
      const productsToUpdate = products.filter(p => 
        offer.applicableProducts.includes(p.id)
      );
      
      for (const product of productsToUpdate) {
        const discountedPrice = Math.round(product.price * (1 - offer.discountPercentage / 100));
        await productDb.updateProduct(product.id, {
          offerPrice: discountedPrice
        });
      }
      
      // Remove discount from products no longer in offer
      if (editingOffer) {
        const productsToRemoveDiscount = products.filter(p => 
          editingOffer.applicableProducts.includes(p.id) && 
          !offer.applicableProducts.includes(p.id)
        );
        
        for (const product of productsToRemoveDiscount) {
          await productDb.updateProduct(product.id, {
            offerPrice: undefined
          });
        }
      }
      
      // Reload products to reflect changes
      await loadProducts();
    } catch (error) {
      console.error("Error applying discount to products:", error);
      toast.error("Failed to apply discount to products");
    }
  };
  
  const handleToggleOfferStatus = async (offer: Offer) => {
    try {
      const updatedOffer = { ...offer, active: !offer.active };
      const updatedOffers = offers.map(o => 
        o.id === offer.id ? updatedOffer : o
      );
      
      localStorage.setItem('offers', JSON.stringify(updatedOffers));
      setOffers(updatedOffers);
      
      // Update product prices based on offer status
      if (!updatedOffer.active) {
        // Deactivated offer - remove discounts
        const productDb = ProductDatabase.getInstance();
        const productsToUpdate = products.filter(p => 
          offer.applicableProducts.includes(p.id)
        );
        
        for (const product of productsToUpdate) {
          await productDb.updateProduct(product.id, {
            offerPrice: undefined
          });
        }
      } else {
        // Reactivated offer - apply discounts again
        await applyDiscountToProducts(updatedOffer);
      }
      
      toast.success(`Offer ${updatedOffer.active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error toggling offer status:", error);
      toast.error("Failed to update offer status");
    }
  };
  
  const handleDeleteOffer = async (offer: Offer) => {
    try {
      // Remove offer
      const updatedOffers = offers.filter(o => o.id !== offer.id);
      localStorage.setItem('offers', JSON.stringify(updatedOffers));
      setOffers(updatedOffers);
      
      // Remove discounts from products
      const productDb = ProductDatabase.getInstance();
      const productsToUpdate = products.filter(p => 
        offer.applicableProducts.includes(p.id)
      );
      
      for (const product of productsToUpdate) {
        await productDb.updateProduct(product.id, {
          offerPrice: undefined
        });
      }
      
      toast.success("Offer deleted successfully");
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  return (
    <CardContent className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-800">Offers Management</h2>
        <Button 
          onClick={handleCreateOffer} 
          className="bg-green-700 hover:bg-green-800 text-white"
        >
          Create New Offer
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No offers found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first offer to attract more customers</p>
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-green-100">
                  <TableRow>
                    <TableHead>Offer Title</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id} className="hover:bg-green-50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium">{offer.title}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{offer.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-red-600">{offer.discountPercentage}% OFF</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(offer.startDate).toLocaleDateString()}</p>
                          <p className="text-gray-500">to</p>
                          <p>{new Date(offer.endDate).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{offer.applicableProducts.length} products</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          offer.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {offer.active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleOfferStatus(offer)}
                            className="text-xs"
                          >
                            {offer.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOffer(offer)}
                            className="text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOffer(offer)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Offer Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={newOffer.title}
                  onChange={handleInputChange}
                  placeholder="Summer Sale"
                />
              </div>
              <div>
                <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                <Input
                  id="discountPercentage"
                  name="discountPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={newOffer.discountPercentage}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={newOffer.description}
                onChange={handleInputChange}
                placeholder="Special discount for summer products"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={newOffer.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={newOffer.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newOffer.active ? "active" : "inactive"} 
                onValueChange={(value) => handleSelectChange('active', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="mb-2 block">Applicable Products</Label>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`product-${product.id}`}
                        checked={newOffer.applicableProducts.includes(product.id)}
                        onChange={(e) => handleProductSelectionChange(product.id, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer">
                        {product.name} - {product.price} EGP
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800 text-white"
              onClick={handleSubmit}
            >
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
};

export default OffersManagement;
