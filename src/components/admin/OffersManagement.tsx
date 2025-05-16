
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Product, ProductCategory, default as ProductDatabase } from '@/models/Product';
import { Badge } from '@/components/ui/badge';
import { Trash, Edit, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface Offer {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  products: string[]; // product IDs
  active: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const OffersManagement = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  
  const [formData, setFormData] = useState<Omit<Offer, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    discountPercentage: 10,
    products: [],
    active: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch products
      const productDb = ProductDatabase.getInstance();
      const allProducts = await productDb.getAllProducts();
      setProducts(allProducts);
      
      // 2. Fetch offers
      const savedOffers = localStorage.getItem('offers');
      if (savedOffers) {
        setOffers(JSON.parse(savedOffers));
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: any = value;
    if (name === 'discountPercentage') {
      processedValue = Number(value);
    } else if (name === 'active') {
      processedValue = value === 'true';
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  const handleProductSelection = (productId: string) => {
    setFormData(prev => {
      const isSelected = prev.products.includes(productId);
      
      if (isSelected) {
        // Remove product
        return {
          ...prev,
          products: prev.products.filter(id => id !== productId)
        };
      } else {
        // Add product
        return {
          ...prev,
          products: [...prev.products, productId]
        };
      }
    });
  };

  const handleAddOffer = () => {
    // Validate form
    if (!formData.name.trim() || formData.products.length === 0) {
      toast.error('Please fill in all required fields and select at least one product.');
      return;
    }
    
    // Create new offer
    const newOffer: Offer = {
      ...formData,
      id: `offer-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    // Add to state and localStorage
    const updatedOffers = [...offers, newOffer];
    setOffers(updatedOffers);
    localStorage.setItem('offers', JSON.stringify(updatedOffers));
    
    // Apply discounts to products
    applyDiscountToProducts(newOffer);
    
    // Close dialog and show success message
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Offer added successfully!');
  };

  const handleUpdateOffer = () => {
    if (!editingOffer) return;
    
    // Validate form
    if (!formData.name.trim() || formData.products.length === 0) {
      toast.error('Please fill in all required fields and select at least one product.');
      return;
    }
    
    // Update offer
    const updatedOffer: Offer = {
      ...formData,
      id: editingOffer.id,
      createdAt: editingOffer.createdAt
    };
    
    // Update state and localStorage
    const updatedOffers = offers.map(offer => 
      offer.id === updatedOffer.id ? updatedOffer : offer
    );
    
    setOffers(updatedOffers);
    localStorage.setItem('offers', JSON.stringify(updatedOffers));
    
    // Apply updated discounts to products
    applyDiscountToProducts(updatedOffer);
    
    // Close dialog and show success message
    setIsEditDialogOpen(false);
    setEditingOffer(null);
    resetForm();
    toast.success('Offer updated successfully!');
  };

  const handleDeleteOffer = (offerId: string) => {
    // Get the offer being deleted
    const offerToDelete = offers.find(o => o.id === offerId);
    
    if (!offerToDelete) return;
    
    // Remove discounts from associated products
    removeDiscountFromProducts(offerToDelete);
    
    // Remove from offers list
    const updatedOffers = offers.filter(offer => offer.id !== offerId);
    setOffers(updatedOffers);
    localStorage.setItem('offers', JSON.stringify(updatedOffers));
    
    toast.success('Offer deleted successfully!');
  };

  const applyDiscountToProducts = (offer: Offer) => {
    const productDb = ProductDatabase.getInstance();
    const discountedProducts: Product[] = [];
    
    // Get all products
    productDb.getAllProducts().then(allProducts => {
      // Find products that are part of this offer
      offer.products.forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
          const discountAmount = (product.price * offer.discountPercentage) / 100;
          const offerPrice = product.price - discountAmount;
          
          // Update product with offer price
          const updatedProduct = {
            ...product,
            offerPrice: Math.round(offerPrice * 100) / 100
          };
          
          discountedProducts.push(updatedProduct);
        }
      });
      
      // Update products in database
      if (discountedProducts.length > 0) {
        productDb.updateProducts(discountedProducts).then(() => {
          console.log(`Applied discounts to ${discountedProducts.length} products`);
          
          // Force refresh of product data in UI
          window.dispatchEvent(new CustomEvent('productsUpdated'));
        });
      }
    });
  };

  const removeDiscountFromProducts = (offer: Offer) => {
    const productDb = ProductDatabase.getInstance();
    
    // Get all products
    productDb.getAllProducts().then(allProducts => {
      const productsToUpdate: Product[] = [];
      
      // Find products that were part of this offer and remove the discount
      offer.products.forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        if (product && product.offerPrice !== undefined) {
          // Create updated product without offer price
          const { offerPrice, ...updatedProduct } = product;
          productsToUpdate.push(updatedProduct as Product);
        }
      });
      
      // Update products in database
      if (productsToUpdate.length > 0) {
        productDb.updateProducts(productsToUpdate).then(() => {
          console.log(`Removed discounts from ${productsToUpdate.length} products`);
          
          // Force refresh of product data in UI
          window.dispatchEvent(new CustomEvent('productsUpdated'));
        });
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountPercentage: 10,
      products: [],
      active: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const handleEditClick = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description,
      discountPercentage: offer.discountPercentage,
      products: [...offer.products],
      active: offer.active,
      startDate: offer.startDate,
      endDate: offer.endDate,
    });
    setIsEditDialogOpen(true);
  };

  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };
  
  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category);
  };

  return (
    <CardContent className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-green-800">Offers Management</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-green-700 hover:bg-green-800 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Offer
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
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-green-100">
              <TableRow>
                <TableHead>Offer Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id} className="hover:bg-green-50 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-medium">{offer.name}</p>
                      <p className="text-sm text-gray-500">{offer.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {offer.discountPercentage}% OFF
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="bg-gray-100">
                        {offer.products.length} products
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Start: {new Date(offer.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(offer.endDate).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {offer.active ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(offer)}
                        className="border-green-500 hover:bg-green-50 text-green-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="border-red-500 hover:bg-red-50 text-red-700"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add Offer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-green-800">Add New Offer</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Offer Name*</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Summer Sale" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage*</Label>
                <Input 
                  id="discountPercentage" 
                  name="discountPercentage" 
                  type="number" 
                  min="1" 
                  max="99" 
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Special summer promotion with great discounts!" 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="date" 
                  value={formData.startDate} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  name="endDate" 
                  type="date" 
                  value={formData.endDate} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
              <Select name="active" value={formData.active.toString()} onValueChange={(value) => {
                setFormData({...formData, active: value === 'true'});
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="block mb-2">Select Products* ({formData.products.length} selected)</Label>
              
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {/* Products by Category */}
                {Object.values(ProductCategory).map(category => (
                  <div key={category} className="mb-4">
                    <h3 className="font-medium text-green-800 mb-2">{category}</h3>
                    <div className="space-y-2 pl-2">
                      {getProductsByCategory(category).length === 0 ? (
                        <p className="text-sm text-gray-500">No products in this category</p>
                      ) : (
                        getProductsByCategory(category).map(product => (
                          <div key={product.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`product-${product.id}`}
                              checked={formData.products.includes(product.id)}
                              onCheckedChange={() => handleProductSelection(product.id)}
                            />
                            <Label 
                              htmlFor={`product-${product.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {product.name} - {product.price} EGP
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddOffer}
              className="bg-green-700 hover:bg-green-800"
            >
              Add Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-green-800">Edit Offer</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Offer Name*</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-discountPercentage">Discount Percentage*</Label>
                <Input 
                  id="edit-discountPercentage" 
                  name="discountPercentage" 
                  type="number" 
                  min="1" 
                  max="99" 
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {/* Remaining form fields are the same as Add form */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input 
                id="edit-description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input 
                  id="edit-startDate" 
                  name="startDate" 
                  type="date" 
                  value={formData.startDate} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input 
                  id="edit-endDate" 
                  name="endDate" 
                  type="date" 
                  value={formData.endDate} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-active">Status</Label>
              <Select name="active" value={formData.active.toString()} onValueChange={(value) => {
                setFormData({...formData, active: value === 'true'});
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="block mb-2">Select Products* ({formData.products.length} selected)</Label>
              
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {Object.values(ProductCategory).map(category => (
                  <div key={category} className="mb-4">
                    <h3 className="font-medium text-green-800 mb-2">{category}</h3>
                    <div className="space-y-2 pl-2">
                      {getProductsByCategory(category).length === 0 ? (
                        <p className="text-sm text-gray-500">No products in this category</p>
                      ) : (
                        getProductsByCategory(category).map(product => (
                          <div key={product.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`edit-product-${product.id}`}
                              checked={formData.products.includes(product.id)}
                              onCheckedChange={() => handleProductSelection(product.id)}
                            />
                            <Label 
                              htmlFor={`edit-product-${product.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {product.name} - {product.price} EGP
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingOffer(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleUpdateOffer}
              className="bg-green-700 hover:bg-green-800"
            >
              Update Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
};

export default OffersManagement;
