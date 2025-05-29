
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
      console.log('Starting product addition with data:', product);
      
      // Validate required fields first
      if (!product.name?.trim()) {
        toast.error('Product name is required');
        return;
      }
      
      if (!product.price || parseFloat(product.price) <= 0) {
        toast.error('Valid product price is required');
        return;
      }

      if (!product.type) {
        toast.error('Product type is required');
        return;
      }

      // Prepare clean product data with proper validation
      const productData = {
        name: product.name.trim(),
        description: product.description?.trim() || '',
        price: parseFloat(product.price),
        type: product.type,
        category: product.category || 'Men',
        main_image: product.main_image || '',
        images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
        colors: Array.isArray(product.colors) ? product.colors.filter(Boolean) : [],
        sizes: Array.isArray(product.sizes) ? product.sizes.filter(size => size?.size) : [],
        discount: parseFloat(product.discount) || 0,
        featured: Boolean(product.featured),
        stock: parseInt(product.stock) || 0,
        inventory: parseInt(product.inventory) || parseInt(product.stock) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Cleaned product data for insert:', productData);
      
      // Attempt to add the product
      const result = await addProduct(productData);
      
      if (result) {
        console.log('Product added successfully:', result);
        setShowAddDialog(false);
        toast.success('Product added successfully!');
        
        // Force a fresh fetch to ensure UI is updated
        setTimeout(() => {
          refetch();
        }, 500);
      } else {
        console.error('Product addition failed - no result returned');
        toast.error('Failed to add product - no response from server');
      }
      
    } catch (error) {
      console.error("Error in handleAddProduct:", error);
      toast.error("Failed to add product: " + (error?.message || 'Unknown error'));
    }
  };

  const handleEditProduct = async (product) => {
    if (!editProduct?.id) {
      toast.error('No product selected for editing');
      return;
    }
    
    try {
      console.log('Starting product update for ID:', editProduct.id);
      console.log('Update data:', product);
      
      // Validate required fields
      if (!product.name?.trim()) {
        toast.error('Product name is required');
        return;
      }
      
      if (!product.price || parseFloat(product.price) <= 0) {
        toast.error('Valid product price is required');
        return;
      }

      // Prepare clean update data
      const updateData = {
        name: product.name.trim(),
        description: product.description?.trim() || '',
        price: parseFloat(product.price),
        type: product.type || 'T-Shirts',
        category: product.category || 'Men',
        main_image: product.main_image || '',
        images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
        colors: Array.isArray(product.colors) ? product.colors.filter(Boolean) : [],
        sizes: Array.isArray(product.sizes) ? product.sizes.filter(size => size?.size) : [],
        discount: parseFloat(product.discount) || 0,
        featured: Boolean(product.featured),
        stock: parseInt(product.stock) || 0,
        inventory: parseInt(product.inventory) || parseInt(product.stock) || 0,
        updated_at: new Date().toISOString()
      };
      
      console.log('Cleaned update data:', updateData);
      
      const result = await updateProduct(editProduct.id, updateData);
      
      if (result) {
        console.log('Product updated successfully:', result);
        setShowEditDialog(false);
        setEditProduct(null);
        toast.success('Product updated successfully!');
        
        // Force a fresh fetch
        setTimeout(() => {
          refetch();
        }, 500);
      } else {
        console.error('Product update failed - no result returned');
        toast.error('Failed to update product - no response from server');
      }
      
    } catch (error) {
      console.error("Error in handleEditProduct:", error);
      toast.error("Failed to update product: " + (error?.message || 'Unknown error'));
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) {
      toast.error('No product selected for deletion');
      return;
    }
    
    try {
      console.log('Deleting product with ID:', deleteProductId);
      
      const result = await deleteProduct(deleteProductId);
      
      if (result) {
        console.log('Product deleted successfully');
        setShowDeleteDialog(false);
        setDeleteProductId(null);
        toast.success('Product deleted successfully!');
        
        // Force a fresh fetch
        setTimeout(() => {
          refetch();
        }, 500);
      } else {
        console.error('Product deletion failed - no result returned');
        toast.error('Failed to delete product - no response from server');
      }
      
    } catch (error) {
      console.error("Error in handleDeleteProduct:", error);
      toast.error("Failed to delete product: " + (error?.message || 'Unknown error'));
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

  // Log current products for debugging
  useEffect(() => {
    console.log('Current products in state:', products);
    console.log('Filtered products:', filteredProducts);
  }, [products, filteredProducts]);

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
              {products.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">Click "Add New Product" to get started</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-green-50">
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Colors</TableHead>
                    <TableHead className="hidden lg:table-cell">Sizes</TableHead>
                    <TableHead className="hidden md:table-cell">Stock</TableHead>
                    <TableHead className="hidden md:table-cell">Price</TableHead>
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
                        {product.colors && Array.isArray(product.colors) && product.colors.length > 0 ? 
                          <div className="max-w-[100px] truncate">{product.colors.join(", ")}</div> : "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 ? 
                          <div className="max-w-[120px] truncate">{product.sizes.map(s => s.size).join(", ")}</div> : "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.sizes && Array.isArray(product.sizes) ? 
                          product.sizes.reduce((total, size) => total + (size?.stock || 0), 0) : 
                          product.stock || 0}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">${product.price}</TableCell>
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
