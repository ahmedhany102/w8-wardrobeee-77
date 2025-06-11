
import React, { useState } from 'react';
import { useSupabaseCoupons } from '@/hooks/useSupabaseCoupons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';

const CouponManagement = () => {
  const { coupons, loading, addCoupon, updateCoupon, deleteCoupon } = useSupabaseCoupons();
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    expiration_date: '',
    usage_limit: '',
    minimum_amount: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, formData);
    } else {
      await addCoupon(formData);
    }
    
    setShowForm(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      expiration_date: '',
      usage_limit: '',
      minimum_amount: '',
      is_active: true
    });
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      expiration_date: coupon.expiration_date ? coupon.expiration_date.split('T')[0] : '',
      usage_limit: coupon.usage_limit?.toString() || '',
      minimum_amount: coupon.minimum_amount.toString(),
      is_active: coupon.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      await deleteCoupon(id);
    }
  };

  if (loading) {
    return <div className="p-6">Loading coupons...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter coupon code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Value</label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder="Enter discount value"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiration Date</label>
                <Input
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <Input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Amount</label>
                <Input
                  type="number"
                  value={formData.minimum_amount}
                  onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                  placeholder="Minimum order amount"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label htmlFor="is_active" className="text-sm font-medium">Active</label>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingCoupon ? 'Update' : 'Create'} Coupon
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingCoupon(null);
                  setFormData({
                    code: '',
                    discount_type: 'percentage',
                    discount_value: '',
                    expiration_date: '',
                    usage_limit: '',
                    minimum_amount: '',
                    is_active: true
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {coupons.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No coupons found. Create your first coupon!</p>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-mono font-bold text-lg">{coupon.code}</span>
                    <span className={`px-2 py-1 rounded text-xs ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Discount:</span>
                      <div className="font-medium">
                        {coupon.discount_value}{coupon.discount_type === 'percentage' ? '%' : ' EGP'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Min Amount:</span>
                      <div className="font-medium">{coupon.minimum_amount} EGP</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Used:</span>
                      <div className="font-medium">
                        {coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Expires:</span>
                      <div className="font-medium">
                        {coupon.expiration_date ? new Date(coupon.expiration_date).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(coupon)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(coupon.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CouponManagement;
