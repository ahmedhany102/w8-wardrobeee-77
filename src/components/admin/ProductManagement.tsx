import React, { useState, useEffect } from "react";
import { Product, default as ProductDatabase } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductForm from "./ProductForm";

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

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
      toast.error("فشل في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product: Omit<Product, "id">) => {
    try {
      const productDb = ProductDatabase.getInstance();
      await productDb.addProduct(product);
      toast.success("تمت إضافة المنتج بنجاح");
      setShowAddDialog(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("فشل في إضافة المنتج");
    }
  };

  const handleEditProduct = async (product: Omit<Product, "id">) => {
    if (!editProduct) return;
    try {
      const productDb = ProductDatabase.getInstance();
      await productDb.updateProduct(editProduct.id, product);
      toast.success("تم تحديث المنتج بنجاح");
      setShowEditDialog(false);
      setEditProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("فشل في تحديث المنتج");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      const productDb = ProductDatabase.getInstance();
      await productDb.deleteProduct(deleteProductId);
      toast.success("تم حذف المنتج بنجاح");
      setShowDeleteDialog(false);
      setDeleteProductId(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("فشل في حذف المنتج");
    }
  };

  // Filter products by search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <input
          placeholder="بحث عن منتج..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64"
        />
        <Button onClick={() => setShowAddDialog(true)} className="bg-green-800 hover:bg-green-900">
          <Plus className="h-4 w-4 mr-2" /> إضافة منتج جديد
        </Button>
        <Button
          onClick={() => {
            localStorage.removeItem('products');
            window.location.reload();
          }}
          className="bg-red-700 hover:bg-red-800 text-white mb-2 md:mb-0"
        >
          مسح كل المنتجات
        </Button>
      </div>
      <Card className="border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white">
          <CardTitle className="text-xl">إدارة المنتجات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">لا يوجد منتجات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-green-50">
                  <TableRow>
                    <TableHead>الصورة</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الألوان</TableHead>
                    <TableHead>الخصم</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow key={product.id} className="hover:bg-green-50 transition-colors">
                      <TableCell>
                        {product.mainImage ? (
                          <img src={product.mainImage} alt={product.name} className="h-14 w-14 object-cover rounded-md" />
                        ) : (
                          <span className="text-gray-400">بدون صورة</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium truncate" title={product.name}>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.type}</TableCell>
                      <TableCell>{product.colors?.join(", ")}</TableCell>
                      <TableCell>{product.hasDiscount && product.discount ? `${product.discount}%` : "-"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditProduct(product);
                            setShowEditDialog(true);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300"
                        >
                          <Pencil className="h-4 w-4 mr-1" /> تعديل
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setDeleteProductId(product.id);
                            setShowDeleteDialog(true);
                          }}
                          className="bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-1" /> حذف
                        </Button>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة منتج جديد</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleAddProduct}
            submitLabel="إضافة المنتج"
          />
          <DialogFooter>
            <Button onClick={() => setShowAddDialog(false)} className="mt-2">إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <ProductForm
              initialData={editProduct}
              onSubmit={handleEditProduct}
              submitLabel="حفظ التعديلات"
            />
          )}
          <DialogFooter>
            <Button onClick={() => setShowEditDialog(false)} className="mt-2">إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Product Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>حذف المنتج</DialogTitle>
          </DialogHeader>
          <p>هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <DialogFooter>
            <Button onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
            <Button onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700 text-white">حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
