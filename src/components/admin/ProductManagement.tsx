
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSupabaseProducts } from "@/hooks/useSupabaseData";
import ProductManagementHeader from "./ProductManagementHeader";
import ProductManagementStats from "./ProductManagementStats";
import ProductManagementTable from "./ProductManagementTable";
import ProductManagementDialogs from "./ProductManagementDialogs";

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
      
      const result = await addProduct(productData);
      
      if (result) {
        setShowAddDialog(false);
        toast.success('Product added successfully!');
        setTimeout(() => {
          refetch();
        }, 500);
      } else {
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
      
      const result = await updateProduct(editProduct.id, updateData);
      
      if (result) {
        setShowEditDialog(false);
        setEditProduct(null);
        toast.success('Product updated successfully!');
        setTimeout(() => {
          refetch();
        }, 500);
      } else {
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
      const result = await deleteProduct(deleteProductId);
      
      if (result) {
        setShowDeleteDialog(false);
        setDeleteProductId(null);
        toast.success('Product deleted successfully!');
        setTimeout(() => {
          refetch();
        }, 500);
      } else {
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

  const handleEditClick = (product) => {
    setEditProduct(product);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (productId) => {
    setDeleteProductId(productId);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-6">
      <ProductManagementHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onAddProduct={() => setShowAddDialog(true)}
        totalProducts={products.length}
      />
      
      <ProductManagementStats totalProducts={products.length} />
      
      <ProductManagementTable
        products={filteredProducts}
        loading={loading}
        onEditProduct={handleEditClick}
        onDeleteProduct={handleDeleteClick}
      />
      
      <ProductManagementDialogs
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        editProduct={editProduct}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
};

export default ProductManagement;
