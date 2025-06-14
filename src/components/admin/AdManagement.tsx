
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useSupabaseAds } from '@/hooks/useSupabaseAds';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  main_image?: string;
  image_url?: string;
  images?: string[];
}

const AdManagement = () => {
  const { ads, loading, refetch } = useSupabaseAds();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  
  // New ad form state
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdImageUrl, setNewAdImageUrl] = useState('');
  const [newAdRedirectUrl, setNewAdRedirectUrl] = useState('');
  const [newAdActive, setNewAdActive] = useState<boolean>(true);
  const [filterPlacement, setFilterPlacement] = useState<string>('all');
  
  // Use Supabase products hook
  const { products } = useSupabaseProducts();

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing && editingAd) {
          setEditingAd({ ...editingAd, image_url: reader.result as string });
        } else {
          setNewAdImageUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new ad
  const handleAddAd = async () => {
    if (!newAdTitle.trim() || !newAdImageUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      console.log('📝 Adding new ad with data:', { title: newAdTitle, active: newAdActive });
      
      const { data, error } = await supabase
        .from('ads')
        .insert([{
          title: newAdTitle.trim(),
          image_url: newAdImageUrl,
          redirect_url: newAdRedirectUrl.trim() || null,
          is_active: newAdActive,
          position: ads.length + 1
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding ad:', error);
        throw error;
      }

      console.log('✅ Ad added successfully:', data);
      toast.success('Ad added successfully!');
      
      // Reset form
      setNewAdTitle('');
      setNewAdImageUrl('');
      setNewAdRedirectUrl('');
      setNewAdActive(true);
      setShowAddDialog(false);
      
      // Refresh ads list
      await refetch();
    } catch (error: any) {
      console.error('❌ Error adding ad:', error);
      toast.error('Failed to add ad: ' + error.message);
    }
  };

  // Update ad
  const handleUpdateAd = async () => {
    if (!editingAd || !editingAd.title?.trim() || !editingAd.image_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      console.log('✏️ Updating ad:', editingAd.id);
      
      const { data, error } = await supabase
        .from('ads')
        .update({
          title: editingAd.title.trim(),
          image_url: editingAd.image_url,
          redirect_url: editingAd.redirect_url?.trim() || null,
          is_active: editingAd.is_active
        })
        .eq('id', editingAd.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating ad:', error);
        throw error;
      }

      console.log('✅ Ad updated successfully:', data);
      toast.success('Ad updated successfully!');
      setEditingAd(null);
      await refetch();
    } catch (error: any) {
      console.error('❌ Error updating ad:', error);
      toast.error('Failed to update ad: ' + error.message);
    }
  };

  // Delete ad - FIXED
  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting ad:', id);
      
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting ad:', error);
        throw error;
      }

      console.log('✅ Ad deleted successfully');
      toast.success('Ad deleted successfully!');
      await refetch();
    } catch (error: any) {
      console.error('❌ Error deleting ad:', error);
      toast.error('Failed to delete ad: ' + error.message);
    }
  };

  // Toggle ad active status
  const toggleAdStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log('🔄 Toggling ad status:', id, 'from', currentStatus, 'to', !currentStatus);
      
      const { error } = await supabase
        .from('ads')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating ad status:', error);
        throw error;
      }

      console.log('✅ Ad status updated successfully');
      toast.success('Ad status updated successfully!');
      await refetch();
    } catch (error: any) {
      console.error('❌ Error updating ad status:', error);
      toast.error('Failed to update ad status: ' + error.message);
    }
  };

  // Filter ads (for now just show all since we don't have placement field yet)
  const filteredAds = ads;

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

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">جاري تحميل الإعلانات...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">لا توجد إعلانات بعد</p>
            <Button onClick={() => setShowAddDialog(true)} className="mt-4">
              إضافة أول إعلان
            </Button>
          </div>
        ) : (
          filteredAds.map(ad => (
            <Card key={ad.id} className={`${ad.is_active ? 'border-green-500' : 'border-gray-300 opacity-60'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{ad.title || 'Untitled Ad'}</CardTitle>
                  <Switch
                    checked={ad.is_active}
                    onCheckedChange={() => toggleAdStatus(ad.id, ad.is_active)}
                  />
                </div>
                <p className="text-sm text-gray-500">Position: {ad.position}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img src={ad.image_url} alt={ad.title || 'Ad'} className="w-full h-32 object-cover rounded" />
                  
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
          ))
        )}
      </div>

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
                  value={editingAd.title || ''}
                  onChange={(e) => setEditingAd({...editingAd, title: e.target.value})}
                  placeholder="عنوان الإعلان"
                />
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
                {editingAd.image_url && (
                  <img src={editingAd.image_url} alt="Preview" className="mt-2 w-full h-24 object-cover rounded" />
                )}
              </div>

              <div>
                <Label htmlFor="edit-redirectUrl">رابط التوجيه</Label>
                <Input
                  id="edit-redirectUrl"
                  value={editingAd.redirect_url || ''}
                  onChange={(e) => setEditingAd({...editingAd, redirect_url: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editingAd.is_active}
                  onCheckedChange={(checked) => setEditingAd({...editingAd, is_active: checked})}
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
