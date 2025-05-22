import React, { useState, useEffect } from "react";
import { Product, default as ProductDatabase } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImprovedProductForm from "./ImprovedProductForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define men's product subcategories
const MEN_SUBCATEGORIES = ['All', 'T-shirts', 'Pants', 'Shoes', 'Jackets'];

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productDb = ProductDatabase.getInstance();
      const allProducts = await productDb.getAllProducts();
      // Only keep men's products
      const menProducts = allProducts.filter(product => 
        product && 
        (product.category === 'رجالي' || 
         product.category === 'Men' || 
         product.category === "Men's")
      );
      setProducts(menProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product: Omit<Product, "id">) => {
    try {
      // Force all products to be men's category
      const menProduct = {
        ...product,
        category: 'Men'
      };
      
      const productDb = ProductDatabase.getInstance();
      await productDb.addProduct(menProduct);
      toast.success("Product added successfully");
      setShowAddDialog(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = async (product: Omit<Product, "id">) => {
    if (!editProduct) return;
    
    try {
      // Force all products to be men's category
      const menProduct = {
        ...product,
        category: 'Men'
      };
      
      const productDb = ProductDatabase.getInstance();
      await productDb.updateProduct(editProduct.id, menProduct);
      toast.success("Product updated successfully");
      setShowEditDialog(false);
      setEditProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      const productDb = ProductDatabase.getInstance();
      await productDb.deleteProduct(deleteProductId);
      toast.success("Product deleted successfully");
      setShowDeleteDialog(false);
      setDeleteProductId(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Filter products by search and subcategory
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (product.type?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesSubcategory = 
      subcategoryFilter === "ALL" || 
      (product.type?.toLowerCase() === subcategoryFilter.toLowerCase());
    
    return matchesSearch && matchesSubcategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            placeholder="Search for a product..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-64"
          />
          <Select 
            value={subcategoryFilter} 
            onValueChange={(value) => setSubcategoryFilter(value)}
            defaultValue="ALL"
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All subcategories</SelectItem>
              {MEN_SUBCATEGORIES.slice(1).map(subcategory => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowAddDialog(true)} className="bg-green-800 hover:bg-green-900 text-sm">
            <Plus className="h-4 w-4 mr-2" /> Add New Product
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem('products');
              window.location.reload();
            }}
            className="bg-red-700 hover:bg-red-800 text-white text-sm"
          >
            Clear All Products
          </Button>
        </div>
      </div>
      
      <Card className="border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white">
          <CardTitle className="text-xl">Product Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Subcategory</TableHead>
                    <TableHead className="hidden lg:table-cell">Sizes</TableHead>
                    <TableHead className="hidden md:table-cell">Stock</TableHead>
                    <TableHead className="hidden md:table-cell">Discount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id} className="hover:bg-green-50 transition-colors">
                      <TableCell>
                        {product.mainImage ? (
                          <img src={product.mainImage} alt={product.name} className="h-10 w-10 object-cover rounded-md" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium truncate" title={product.name}>
                        <div className="max-w-[120px] truncate">{product.name}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{product.type || 'T-shirts'}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.sizes && product.sizes.length > 0 ? 
                          <div className="max-w-[120px] truncate">{product.sizes.map(s => s.size).join(", ")}</div> : "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.sizes ? 
                          product.sizes.reduce((total, size) => total + (size?.stock || 0), 0) : 
                          product.stock || 0}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{product.hasDiscount && product.discount ? `${product.discount}%` : "-"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditProduct(product);
                              setShowEditDialog(true);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 p-1 h-auto"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setDeleteProductId(product.id);
                              setShowDeleteDialog(true);
                            }}
                            className="bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-600 p-1 h-auto"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ImprovedProductForm
            onSubmit={handleAddProduct}
            submitLabel="Add Product"
            onCancel={() => setShowAddDialog(false)}
            subcategories={MEN_SUBCATEGORIES.slice(1)}  // Exclude 'All'
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <ImprovedProductForm
              initialData={editProduct}
              onSubmit={handleEditProduct}
              submitLabel="Save Changes"
              onCancel={() => setShowEditDialog(false)}
              subcategories={MEN_SUBCATEGORIES.slice(1)}  // Exclude 'All'
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Product Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this product? This action cannot be undone.</p>
          <DialogFooter>
            <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
