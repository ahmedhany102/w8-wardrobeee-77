
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, Tag } from 'lucide-react';
import { Product } from '@/models/Product';

interface Offer {
  id: string;
  name: string;
  discount: number;
  products: string[]; // IDs of products included in the offer
  createdAt: string;
  validUntil: string;
}

const OffersManagement: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    name: '',
    discount: 10,
    products: [],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });

  // Load offers and products from localStorage
  useEffect(() => {
    loadOffers();
    loadProducts();
  }, []);

  const loadOffers = () => {
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
      // Create sample offer if none exist
      const sampleOffers = [{
        id: `offer-${Date.now()}`,
        name: "Summer Sale",
        discount: 15,
        products: [],
        createdAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      }];
      setOffers(sampleOffers);
      localStorage.setItem('offers', JSON.stringify(sampleOffers));
    }
  };

  const loadProducts = () => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        setProducts(parsedProducts);
      } catch (error) {
        console.error("Error parsing products:", error);
        setProducts([]);
      }
    }
  };

  // Save offers to localStorage
  const saveOffers = (updatedOffers: Offer[]) => {
    localStorage.setItem('offers', JSON.stringify(updatedOffers));
    
    // Update product prices with offers
    applyOffersToProducts(updatedOffers);
  };

  // Apply offer discounts to products
  const applyOffersToProducts = (currentOffers: Offer[]) => {
    const updatedProducts = products.map(product => {
      // Find if this product is in any active offer
      const applicableOffer = currentOffers.find(offer => 
        offer.products.includes(product.id) && 
        new Date(offer.validUntil) > new Date()
      );
      
      if (applicableOffer) {
        // Apply discount
        const discountedPrice = Math.round((product.price * (100 - applicableOffer.discount)) / 100);
        return { ...product, offerPrice: discountedPrice };
      } else {
        // Remove offer price if not in any offer
        const { offerPrice, ...productWithoutOffer } = product;
        return productWithoutOffer;
      }
    });
    
    // Save updated products
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const handleCreateOffer = () => {
    setIsCreating(true);
    setNewOffer({
      name: '',
      discount: 10,
      products: [],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleSaveNewOffer = () => {
    if (!newOffer.name || newOffer.discount === undefined || !newOffer.validUntil) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const offer: Offer = {
      id: isEditing || `offer-${Date.now()}`,
      name: newOffer.name,
      discount: newOffer.discount,
      products: newOffer.products || [],
      createdAt: isEditing ? offers.find(o => o.id === isEditing)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      validUntil: new Date(`${newOffer.validUntil}T23:59:59`).toISOString()
    };
    
    let updatedOffers: Offer[];
    
    if (isEditing) {
      // Update existing offer
      updatedOffers = offers.map(o => o.id === isEditing ? offer : o);
      toast.success("Offer updated successfully!");
    } else {
      // Add new offer
      updatedOffers = [...offers, offer];
      toast.success("New offer created successfully!");
    }
    
    setOffers(updatedOffers);
    saveOffers(updatedOffers);
    setIsCreating(false);
    setIsEditing(null);
    setNewOffer({
      name: '',
      discount: 10,
      products: [],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleEditOffer = (offerId: string) => {
    const offerToEdit = offers.find(o => o.id === offerId);
    if (offerToEdit) {
      setNewOffer({
        name: offerToEdit.name,
        discount: offerToEdit.discount,
        products: offerToEdit.products,
        validUntil: new Date(offerToEdit.validUntil).toISOString().split('T')[0]
      });
      setIsEditing(offerId);
      setIsCreating(true);
    }
  };

  const handleDeleteOffer = (offerId: string) => {
    const updatedOffers = offers.filter(offer => offer.id !== offerId);
    setOffers(updatedOffers);
    saveOffers(updatedOffers);
    toast.success("Offer deleted successfully");
  };

  const toggleProductInOffer = (productId: string) => {
    setNewOffer(prev => {
      const currentProducts = prev.products || [];
      if (currentProducts.includes(productId)) {
        return { ...prev, products: currentProducts.filter(id => id !== productId) };
      } else {
        return { ...prev, products: [...currentProducts, productId] };
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOfferActive = (validUntil: string) => {
    return new Date(validUntil) > new Date();
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
        <CardTitle className="flex items-center">
          <Tag className="mr-2" />
          Offers Management
        </CardTitle>
        <CardDescription className="text-white/80">Create and manage special offers and discounts</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isCreating ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{isEditing ? "Edit Offer" : "Create New Offer"}</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Offer Name</label>
              <Input
                value={newOffer.name}
                onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
                placeholder="Summer Sale"
                className="w-full dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Discount Percentage</label>
              <Input
                type="number"
                min="1"
                max="99"
                value={newOffer.discount}
                onChange={(e) => setNewOffer({ ...newOffer, discount: parseInt(e.target.value) })}
                className="w-full dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <Input
                type="date"
                value={newOffer.validUntil}
                onChange={(e) => setNewOffer({ ...newOffer, validUntil: e.target.value })}
                className="w-full dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Select Products</label>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto bg-white dark:bg-gray-800">
                {products.map(product => (
                  <div key={product.id} className="flex items-center space-x-2 py-1 border-b last:border-b-0">
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={(newOffer.products || []).includes(product.id)}
                      onCheckedChange={() => toggleProductInOffer(product.id)}
                    />
                    <label htmlFor={`product-${product.id}`} className="cursor-pointer flex-grow text-sm dark:text-white">
                      {product.name} - {product.price} EGP
                    </label>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-gray-500 p-2 text-center">No products available</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSaveNewOffer} className="bg-green-700 hover:bg-green-800">
                {isEditing ? "Update Offer" : "Save Offer"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Button onClick={handleCreateOffer} className="bg-green-700 hover:bg-green-800">
                <Plus className="h-4 w-4 mr-1" /> Create New Offer
              </Button>
            </div>
            
            {offers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-green-50 dark:bg-green-900/20">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map(offer => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium dark:text-white">{offer.name}</TableCell>
                        <TableCell className="dark:text-white">{offer.discount}%</TableCell>
                        <TableCell className="dark:text-white">{formatDate(offer.validUntil)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isOfferActive(offer.validUntil) 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {isOfferActive(offer.validUntil) ? 'Active' : 'Expired'}
                          </span>
                        </TableCell>
                        <TableCell className="dark:text-white">
                          {offer.products.length} products
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOffer(offer.id)}
                            className="h-8 w-8 text-green-800 hover:text-green-700 dark:text-green-400"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="h-8 w-8 text-red-800 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-500 dark:text-gray-400">No offers found. Create your first offer!</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OffersManagement;
