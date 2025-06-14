
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  redirectUrl: string;
  isActive: boolean;
  placement: 'home' | 'sidebar' | 'product';
  productId?: string;
  responsiveSize: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

interface Product {
  id: string;
  name: string;
  main_image?: string;
  image_url?: string;
  images?: string[];
}

const AdManagement = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  
  // New ad form state
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdImageUrl, setNewAdImageUrl] = useState('');
  const [newAdRedirectUrl, setNewAdRedirectUrl] = useState('');
  const [newAdPlacement, setNewAdPlacement] = useState<'home' | 'sidebar' | 'product'>('home');
  const [newAdActive, setNewAdActive] = useState<boolean>(true);
  const [newAdProductId, setNewAdProductId] = useState<string>('');
  const [filterPlacement, setFilterPlacement] = useState<string>('all');
  const [newAdResponsiveSize, setNewAdResponsiveSize] = useState({ desktop: 100, tablet: 100, mobile: 100 });
  
  // Use Supabase products hook instead of ProductDatabase
  const { products } = useSupabaseProducts();
  
  // Load ads from localStorage
  useEffect(() => {
    try {
      const storedAds = localStorage.getItem('ads');
      if (storedAds) {
        const parsedAds = JSON.parse(storedAds);
        setAds(Array.isArray(parsedAds) ? parsedAds : []);
      }
    } catch (error) {
      console.error('Error loading ads:', error);
      setAds([]);
      toast.error('Failed to load advertisements');
    }
  }, []);
  
  // Save ads to localStorage
  const saveAds = (updatedAds: Ad[]) => {
    try {
      localStorage.setItem('ads', JSON.stringify(updatedAds));
      setAds(updatedAds);
      toast.success('Advertisements updated successfully');
    } catch (error) {
      console.error('Error saving ads:', error);
      toast.error('Failed to save advertisements');
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing && editingAd) {
          setEditingAd({ ...editingAd, imageUrl: reader.result as string });
        } else {
          setNewAdImageUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new ad
  const handleAddAd = () => {
    if (!newAdTitle.trim() || !newAdImageUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAd: Ad = {
      id: Date.now().toString(),
      title: newAdTitle.trim(),
      imageUrl: newAdImageUrl,
      redirectUrl: newAdRedirectUrl.trim(),
      isActive: newAdActive,
      placement: newAdPlacement,
      productId: newAdProductId || undefined,
      responsiveSize: newAdResponsiveSize
    };

    const updatedAds = [...ads, newAd];
    saveAds(updatedAds);

    // Reset form
    setNewAdTitle('');
    setNewAdImageUrl('');
    setNewAdRedirectUrl('');
    setNewAdPlacement('home');
    setNewAdActive(true);
    setNewAdProductId('');
    setNewAdResponsiveSize({ desktop: 100, tablet: 100, mobile: 100 });
    setShowAddDialog(false);
  };

  // Update ad
  const handleUpdateAd = () => {
    if (!editingAd || !editingAd.title.trim() || !editingAd.imageUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedAds = ads.map(ad => ad.id === editingAd.id ? editingAd : ad);
    saveAds(updatedAds);
    setEditingAd(null);
  };

  // Delete ad
  const handleDeleteAd = (id: string) => {
    const updatedAds = ads.filter(ad => ad.id !== id);
    saveAds(updatedAds);
  };

  // Toggle ad active status
  const toggleAdStatus = (id: string) => {
    const updatedAds = ads.map(ad => 
      ad.id === id ? { ...ad, isActive: !ad.isActive } : ad
    );
    saveAds(updatedAds);
  };

  // Filter ads by placement
  const filteredAds = filterPlacement === 'all' ? ads : ads.filter(ad => ad.placement === filterPlacement);

  const getProductImageUrl = (product: Product): string => {
    return product.main_image || 
           product.image_url || 
           (product.images && product.images.length > 0 ? product.images[0] : '') ||
           '/placeholder.svg';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة الإعلانات</h2>
          <p className="text-gray-600">إدارة الإعلانات المعروضة في الموقع</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
          إضافة إعلان جديد
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs value={filterPlacement} onValueChange={setFilterPlacement}>
        <TabsList>
          <TabsTrigger value="all">جميع الإعلانات</TabsTrigger>
          <TabsTrigger value="home">الصفحة الرئيسية</TabsTrigger>
          <TabsTrigger value="sidebar">الشريط الجانبي</TabsTrigger>
          <TabsTrigger value="product">صفحات المنتجات</TabsTrigger>
        </TabsList>

        <TabsContent value={filterPlacement} className="mt-6">
          {/* Ads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map(ad => (
              <Card key={ad.id} className={`${ad.isActive ? 'border-green-500' : 'border-gray-300 opacity-60'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{ad.title}</CardTitle>
                    <Switch
                      checked={ad.isActive}
                      onCheckedChange={() => toggleAdStatus(ad.id)}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{ad.placement}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover rounded" />
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setEditingAd(ad)}
                        className="flex-1"
                      >
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteAd(ad.id)}
                        className="flex-1"
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAds.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد إعلانات بعد</p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                إضافة أول إعلان
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Ad Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة إعلان جديد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان الإعلان*</Label>
              <Input
                id="title"
                value={newAdTitle}
                onChange={(e) => setNewAdTitle(e.target.value)}
                placeholder="عنوان الإعلان"
              />
            </div>

            <div>
              <Label htmlFor="placement">موضع الإعلان</Label>
              <select
                id="placement"
                value={newAdPlacement}
                onChange={(e) => setNewAdPlacement(e.target.value as 'home' | 'sidebar' | 'product')}
                className="w-full p-2 border rounded"
              >
                <option value="home">الصفحة الرئيسية</option>
                <option value="sidebar">الشريط الجانبي</option>
                <option value="product">صفحات المنتجات</option>
              </select>
            </div>

            <div>
              <Label htmlFor="image">صورة الإعلان*</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {newAdImageUrl && (
                <img src={newAdImageUrl} alt="Preview" className="mt-2 w-full h-24 object-cover rounded" />
              )}
            </div>

            <div>
              <Label htmlFor="redirectUrl">رابط التوجيه</Label>
              <Input
                id="redirectUrl"
                value={newAdRedirectUrl}
                onChange={(e) => setNewAdRedirectUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {newAdPlacement === 'product' && (
              <div>
                <Label htmlFor="productId">ربط بمنتج (اختياري)</Label>
                <select
                  id="productId"
                  value={newAdProductId}
                  onChange={(e) => setNewAdProductId(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">اختر منتج</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={newAdActive}
                onCheckedChange={setNewAdActive}
              />
              <Label htmlFor="active">نشط</Label>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowAddDialog(false)} variant="outline">
              إلغاء
            </Button>
            <Button onClick={handleAddAd} className="bg-green-600 hover:bg-green-700">
              إضافة الإعلان
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ad Dialog */}
      <Dialog open={!!editingAd} onOpenChange={() => setEditingAd(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الإعلان</DialogTitle>
          </DialogHeader>
          
          {editingAd && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">عنوان الإعلان*</Label>
                <Input
                  id="edit-title"
                  value={editingAd.title}
                  onChange={(e) => setEditingAd({...editingAd, title: e.target.value})}
                  placeholder="عنوان الإعلان"
                />
              </div>

              <div>
                <Label htmlFor="edit-placement">موضع الإعلان</Label>
                <select
                  id="edit-placement"
                  value={editingAd.placement}
                  onChange={(e) => setEditingAd({...editingAd, placement: e.target.value as 'home' | 'sidebar' | 'product'})}
                  className="w-full p-2 border rounded"
                >
                  <option value="home">الصفحة الرئيسية</option>
                  <option value="sidebar">الشريط الجانبي</option>
                  <option value="product">صفحات المنتجات</option>
                </select>
              </div>

              <div>
                <Label htmlFor="edit-image">صورة الإعلان*</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {editingAd.imageUrl && (
                  <img src={editingAd.imageUrl} alt="Preview" className="mt-2 w-full h-24 object-cover rounded" />
                )}
              </div>

              <div>
                <Label htmlFor="edit-redirectUrl">رابط التوجيه</Label>
                <Input
                  id="edit-redirectUrl"
                  value={editingAd.redirectUrl}
                  onChange={(e) => setEditingAd({...editingAd, redirectUrl: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>

              {editingAd.placement === 'product' && (
                <div>
                  <Label htmlFor="edit-productId">ربط بمنتج (اختياري)</Label>
                  <select
                    id="edit-productId"
                    value={editingAd.productId || ''}
                    onChange={(e) => setEditingAd({...editingAd, productId: e.target.value || undefined})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">اختر منتج</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editingAd.isActive}
                  onCheckedChange={(checked) => setEditingAd({...editingAd, isActive: checked})}
                />
                <Label htmlFor="edit-active">نشط</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setEditingAd(null)} variant="outline">
              إلغاء
            </Button>
            <Button onClick={handleUpdateAd} className="bg-green-600 hover:bg-green-700">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdManagement;
