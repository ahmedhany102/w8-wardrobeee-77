
import React, { useState, useEffect } from "react";
import { Coupon, CouponDatabase } from "@/models/Coupon";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Pencil, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);
  
  const [couponFormData, setCouponFormData] = useState<{
    code: string;
    discountPercentage: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    usageLimit?: number;
    description?: string;
  }>({
    code: '',
    discountPercentage: 10,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    usageLimit: undefined,
    description: '',
  });

  useEffect(() => {
    fetchCoupons();
    
    // Listen for coupon updates
    window.addEventListener('couponsUpdated', fetchCoupons);
    return () => {
      window.removeEventListener('couponsUpdated', fetchCoupons);
    };
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const couponDb = CouponDatabase.getInstance();
      const allCoupons = await couponDb.getAllCoupons();
      setCoupons(allCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("فشل في تحميل كوبونات الخصم");
    } finally {
      setLoading(false);
    }
  };

  const resetFormData = () => {
    setCouponFormData({
      code: '',
      discountPercentage: 10,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      usageLimit: undefined,
      description: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCouponFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'discountPercentage' || name === 'usageLimit') {
      setCouponFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else {
      setCouponFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddCoupon = async () => {
    try {
      const couponDb = CouponDatabase.getInstance();
      await couponDb.addCoupon({
        ...couponFormData,
        code: couponFormData.code.toUpperCase(),
      });
      toast.success("تم إضافة كوبون الخصم بنجاح");
      setShowAddDialog(false);
      resetFormData();
      fetchCoupons();
    } catch (error: any) {
      console.error("Error adding coupon:", error);
      toast.error(error.message || "فشل في إضافة كوبون الخصم");
    }
  };

  const handleEditCoupon = async () => {
    if (!editCoupon) return;
    try {
      const couponDb = CouponDatabase.getInstance();
      await couponDb.updateCoupon(editCoupon.id, {
        ...couponFormData,
        code: couponFormData.code.toUpperCase(),
      });
      toast.success("تم تحديث كوبون الخصم بنجاح");
      setShowEditDialog(false);
      setEditCoupon(null);
      resetFormData();
      fetchCoupons();
    } catch (error: any) {
      console.error("Error updating coupon:", error);
      toast.error(error.message || "فشل في تحديث كوبون الخصم");
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteCouponId) return;
    try {
      const couponDb = CouponDatabase.getInstance();
      await couponDb.deleteCoupon(deleteCouponId);
      toast.success("تم حذف كوبون الخصم بنجاح");
      setShowDeleteDialog(false);
      setDeleteCouponId(null);
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("فشل في حذف كوبون الخصم");
    }
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditCoupon(coupon);
    setCouponFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit,
      description: coupon.description || '',
    });
    setShowEditDialog(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch {
      return 'Invalid Date';
    }
  };

  const isCouponActive = (coupon: Coupon) => {
    const now = new Date();
    return (
      coupon.isActive &&
      new Date(coupon.validFrom) <= now &&
      new Date(coupon.validUntil) >= now &&
      (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-xl font-bold">إدارة كوبونات الخصم</h2>
        <Button
          onClick={() => {
            resetFormData();
            setShowAddDialog(true);
          }}
          className="bg-green-800 hover:bg-green-900 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" /> إضافة كوبون جديد
        </Button>
      </div>

      <Card className="border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white">
          <CardTitle className="text-xl">كوبونات الخصم</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">لا يوجد كوبونات خصم</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-green-50">
                  <TableRow>
                    <TableHead>الكود</TableHead>
                    <TableHead>الخصم (%)</TableHead>
                    <TableHead className="hidden md:table-cell">صالح من</TableHead>
                    <TableHead className="hidden md:table-cell">صالح حتى</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="hidden lg:table-cell">الاستخدامات</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map(coupon => (
                    <TableRow key={coupon.id} className="hover:bg-green-50 transition-colors">
                      <TableCell className="font-bold">{coupon.code}</TableCell>
                      <TableCell>{coupon.discountPercentage}%</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(coupon.validFrom)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(coupon.validUntil)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            isCouponActive(coupon)
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }
                        >
                          {isCouponActive(coupon) ? 'مفعل' : 'غير مفعل'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            onClick={() => openEditDialog(coupon)}
                            className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 p-1 h-auto"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setDeleteCouponId(coupon.id);
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

      {/* Add Coupon Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة كوبون خصم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">كود الخصم*</label>
                <input
                  type="text"
                  name="code"
                  value={couponFormData.code}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="مثال: SUMMER2025"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نسبة الخصم (%)*</label>
                <input
                  type="number"
                  name="discountPercentage"
                  min="1"
                  max="100"
                  value={couponFormData.discountPercentage}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">صالح من*</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={couponFormData.validFrom}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">صالح حتى*</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={couponFormData.validUntil}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الحد الأقصى للاستخدام</label>
                <input
                  type="number"
                  name="usageLimit"
                  min="1"
                  value={couponFormData.usageLimit || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="اتركه فارغا للاستخدام غير المحدود"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">وصف</label>
                <textarea
                  name="description"
                  value={couponFormData.description || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm"
                  rows={2}
                  placeholder="وصف اختياري للكوبون"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={couponFormData.isActive}
                  onChange={handleInputChange}
                  id="isActive"
                  className="mr-2"
                />
                <label htmlFor="isActive">مفعل</label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" onClick={() => setShowAddDialog(false)} className="w-full sm:w-auto">
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleAddCoupon}
              className="w-full sm:w-auto bg-green-700 hover:bg-green-800"
            >
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل كوبون الخصم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">كود الخصم*</label>
                <input
                  type="text"
                  name="code"
                  value={couponFormData.code}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="مثال: SUMMER2025"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نسبة الخصم (%)*</label>
                <input
                  type="number"
                  name="discountPercentage"
                  min="1"
                  max="100"
                  value={couponFormData.discountPercentage}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">صالح من*</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={couponFormData.validFrom}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">صالح حتى*</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={couponFormData.validUntil}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الحد الأقصى للاستخدام</label>
                <input
                  type="number"
                  name="usageLimit"
                  min="1"
                  value={couponFormData.usageLimit || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="اتركه فارغا للاستخدام غير المحدود"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">وصف</label>
                <textarea
                  name="description"
                  value={couponFormData.description || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-sm"
                  rows={2}
                  placeholder="وصف اختياري للكوبون"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={couponFormData.isActive}
                  onChange={handleInputChange}
                  id="editIsActive"
                  className="mr-2"
                />
                <label htmlFor="editIsActive">مفعل</label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" onClick={() => setShowEditDialog(false)} className="w-full sm:w-auto">
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleEditCoupon}
              className="w-full sm:w-auto bg-green-700 hover:bg-green-800"
            >
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Coupon Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>حذف كوبون الخصم</DialogTitle>
          </DialogHeader>
          <p>هل أنت متأكد أنك تريد حذف هذا الكوبون؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <DialogFooter>
            <Button type="button" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleDeleteCoupon}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponManagement;
