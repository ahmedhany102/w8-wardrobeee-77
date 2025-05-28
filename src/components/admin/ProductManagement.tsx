
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImprovedProductForm from "./ImprovedProductForm";
import { useSupabaseProducts } from "@/hooks/useSupabaseData";

const ProductManagement = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct, refetch } = useSupabaseProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const handleAddProduct = async (product) => {
    try {
      // Remove any problematic fields that might cause schema issues
      const cleanProduct = {
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        type: product.type || 'T-Shirts',
        category: 'Men',
        main_image: product.main_image || '',
        images: product.images || [],
        colors: product.colors || [],
        sizes: product.sizes || [],
        discount: product.discount || 0,
        featured: product.featured || false,
        stock: product.stock || 0,
        inventory: product.inventory || 0
      };
      
      console.log('Adding product with clean data:', cleanProduct);
      await addProduct(cleanProduct);
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product: " + error.message);
    }
  };

  const handleEditProduct = async (product) => {
    if (!editProduct) return;
    
    try {
      // Clean the product data to avoid schema issues
      const cleanProduct = {
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        type: product.type || 'T-Shirts',
        category: 'Men',
        main_image: product.main_image || '',
        images: product.images || [],
        colors: product.colors || [],
        sizes: product.sizes || [],
        discount: product.discount || 0,
        featured: product.featured || false,
        stock: product.stock || 0,
        inventory: product.inventory || 0
      };
      
      console.log('Updating product with clean data:', cleanProduct);
      await updateProduct(editProduct.id, cleanProduct);
      setShowEditDialog(false);
      setEditProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product: " + error.message);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProduct(deleteProductId);
      setShowDeleteDialog(false);
      setDeleteProductId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product: " + error.message);
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (product.type?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesCategory = 
      categoryFilter === "ALL" || 
      product.type === categoryFilter;
    
    return matchesSearch && matchesCategory;
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
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-48"
          >
            <option value="ALL">All Categories</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Trousers">Trousers</option>
            <option value="Shoes">Shoes</option>
            <option value="Jackets">Jackets</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowAddDialog(true)} className="bg-green-800 hover:bg-green-900 text-sm">
            <Plus className="h-4 w-4 mr-2" /> Add New Product
          </Button>
        </div>
      </div>
      
      <Card className="border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white">
          <CardTitle className="text-xl">Product Management - Total: {products.length}</CardTitle>
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
                    <TableHead className="hidden md:table-cell">Type</TableHead>
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
                        {product.main_image ? (
                          <img src={product.main_image} alt={product.name} className="h-10 w-10 object-cover rounded-md" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium truncate" title={product.name}>
                        <div className="max-w-[120px] truncate">{product.name}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{product.type || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 ? 
                          <div className="max-w-[120px] truncate">{product.sizes.map(s => s.size).join(", ")}</div> : "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.sizes && Array.isArray(product.sizes) ? 
                          product.sizes.reduce((total, size) => total + (size?.stock || 0), 0) : 
                          product.stock || 0}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{product.discount ? `${product.discount}%` : "-"}</TableCell>
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
            predefinedCategories={['Men']} 
            predefinedTypes={['T-Shirts', 'Trousers', 'Shoes', 'Jackets']}
            allowSizesWithoutColors={true}
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
              predefinedCategories={['Men']} 
              predefinedTypes={['T-Shirts', 'Trousers', 'Shoes', 'Jackets']}
              allowSizesWithoutColors={true}
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
