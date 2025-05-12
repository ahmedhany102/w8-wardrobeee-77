
import React, { useState, useEffect } from "react";
import { Product, ProductCategory, default as ProductDatabase } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Search, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string | ProductCategory>("ALL");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: ProductCategory.FOOD,
    imageUrl: "",
    stock: 0,
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productDb = ProductDatabase.getInstance();
      const allProducts = await productDb.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      const productDb = ProductDatabase.getInstance();
      await productDb.addProduct({
        name: formData.name || "",
        description: formData.description || "",
        price: formData.price || 0,
        category: formData.category || ProductCategory.FOOD,
        imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=800",
        stock: formData.stock || 0,
      });
      
      toast.success("Product added successfully");
      setShowAddDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };
  
  const handleEditProduct = async () => {
    if (!selectedProductId) return;
    
    try {
      const productDb = ProductDatabase.getInstance();
      await productDb.updateProduct(selectedProductId, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        imageUrl: formData.imageUrl,
        stock: formData.stock,
      });
      
      toast.success("Product updated successfully");
      setShowEditDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };
  
  const handleDeleteProduct = async () => {
    if (!selectedProductId) return;
    
    try {
      const productDb = ProductDatabase.getInstance();
      await productDb.deleteProduct(selectedProductId);
      
      toast.success("Product deleted successfully");
      setShowDeleteDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: ProductCategory.FOOD,
      imageUrl: "",
      stock: 0,
    });
    setSelectedProductId(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (name === "price" || name === "stock") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const openEditDialog = (product: Product) => {
    setSelectedProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setShowEditDialog(true);
  };
  
  const openDeleteDialog = (productId: string) => {
    setSelectedProductId(productId);
    setShowDeleteDialog(true);
  };
  
  const getCategoryColor = (category: ProductCategory) => {
    switch (category) {
      case ProductCategory.FOOD:
        return "bg-amber-500 text-black hover:bg-amber-600";
      case ProductCategory.TECHNOLOGY:
        return "bg-blue-500 text-white hover:bg-blue-600";
      case ProductCategory.CLOTHING:
        return "bg-purple-500 text-white hover:bg-purple-600";
      case ProductCategory.SHOES:
        return "bg-pink-500 text-white hover:bg-pink-600";
      default:
        return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };
  
  // Filter products based on search term and active tab
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = activeTab === "ALL" || product.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="relative md:max-w-sm w-full flex">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all hover:border-green-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-green-800 hover:bg-green-900"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Product
        </Button>
      </div>
      
      <Card className="border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white">
          <CardTitle className="text-xl">Product Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="ALL" value={activeTab as string} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="flex overflow-x-auto py-2">
                <TabsTrigger 
                  value="ALL" 
                  className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
                >
                  All Products
                </TabsTrigger>
                <TabsTrigger 
                  value={ProductCategory.FOOD} 
                  className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
                >
                  Food
                </TabsTrigger>
                <TabsTrigger 
                  value={ProductCategory.TECHNOLOGY} 
                  className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
                >
                  Technology
                </TabsTrigger>
                <TabsTrigger 
                  value={ProductCategory.CLOTHING} 
                  className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
                >
                  Clothing
                </TabsTrigger>
                <TabsTrigger 
                  value={ProductCategory.SHOES} 
                  className="data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
                >
                  Shoes
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={activeTab as string} className="mt-0 p-0">
              {loading ? (
                <div className="flex justify-center items-center p-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-green-50">
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow 
                          key={product.id} 
                          className="hover:bg-green-50 transition-colors"
                        >
                          <TableCell>
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-14 w-14 object-cover rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=800";
                              }}
                            />
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="font-medium truncate" title={product.name}>{product.name}</div>
                            <div className="text-sm text-gray-500 truncate" title={product.description}>
                              {product.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(product.category)}>
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.price.toFixed(2)} EGP</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                              className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300"
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(product.id)}
                              className="bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the details to add a new product to the catalog
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-3">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (EGP)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="mt-1"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                required
              >
                {Object.values(ProductCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default image
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddProduct}
              className="bg-green-800 hover:bg-green-900"
            >
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-3">
            <div>
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (EGP)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="mt-1"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <select
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                required
              >
                {Object.values(ProductCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditProduct}
              className="bg-green-800 hover:bg-green-900"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Product Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
