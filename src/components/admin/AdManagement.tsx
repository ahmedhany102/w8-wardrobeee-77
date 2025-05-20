
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash, Pencil, Plus, Image, Link, ExternalLink, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';

interface Ad {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
  placement?: 'home' | 'sidebar' | 'product';
  active: boolean;
  order?: number;
}

const AdManagement = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [newAdImage, setNewAdImage] = useState<string>('');
  const [newAdTitle, setNewAdTitle] = useState<string>('');
  const [newAdLink, setNewAdLink] = useState<string>('');
  const [newAdPlacement, setNewAdPlacement] = useState<'home' | 'sidebar' | 'product'>('home');
  const [newAdActive, setNewAdActive] = useState<boolean>(true);
  
  // Load ads from localStorage
  useEffect(() => {
    const storedAds = localStorage.getItem('homeAds');
    if (storedAds) {
      try {
        setAds(JSON.parse(storedAds));
      } catch (error) {
        console.error('Error parsing ads:', error);
        toast.error('Failed to load advertisements');
      }
    }
  }, []);
  
  // Save ads to localStorage
  const saveAds = (updatedAds: Ad[]) => {
    try {
      localStorage.setItem('homeAds', JSON.stringify(updatedAds));
      setAds(updatedAds);
      
      // Trigger event for components like AdCarousel to refresh
      const event = new Event('adsUpdated');
      window.dispatchEvent(event);
      
      return true;
    } catch (error) {
      console.error('Error saving ads:', error);
      toast.error('Failed to save advertisements');
      return false;
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Add new ad
  const handleAddAd = () => {
    if (!newAdImage) {
      toast.error('Please upload an image for the advertisement');
      return;
    }
    
    const newAd: Ad = {
      id: `ad-${Date.now()}`,
      imageUrl: newAdImage,
      title: newAdTitle,
      link: newAdLink || '#',
      placement: newAdPlacement,
      active: newAdActive,
      order: ads.length + 1
    };
    
    const updatedAds = [...ads, newAd];
    if (saveAds(updatedAds)) {
      toast.success('Advertisement added successfully');
      
      // Reset form
      setNewAdImage('');
      setNewAdTitle('');
      setNewAdLink('');
      setNewAdPlacement('home');
      setNewAdActive(true);
      setIsAddDialogOpen(false);
    }
  };
  
  // Edit ad
  const handleEditAd = () => {
    if (!currentAd) return;
    
    const updatedAd: Ad = {
      ...currentAd,
      imageUrl: newAdImage || currentAd.imageUrl,
      title: newAdTitle,
      link: newAdLink || '#',
      placement: newAdPlacement,
      active: newAdActive
    };
    
    const updatedAds = ads.map(ad => ad.id === currentAd.id ? updatedAd : ad);
    if (saveAds(updatedAds)) {
      toast.success('Advertisement updated successfully');
      
      // Reset form
      setIsEditDialogOpen(false);
      setCurrentAd(null);
      setNewAdImage('');
      setNewAdTitle('');
      setNewAdLink('');
      setNewAdPlacement('home');
      setNewAdActive(true);
    }
  };
  
  // Delete ad
  const handleDeleteAd = () => {
    if (!currentAd) return;
    
    const updatedAds = ads.filter(ad => ad.id !== currentAd.id);
    if (saveAds(updatedAds)) {
      toast.success('Advertisement deleted successfully');
      setIsDeleteDialogOpen(false);
      setCurrentAd(null);
    }
  };
  
  // Toggle ad active status
  const toggleAdStatus = (adId: string) => {
    const updatedAds = ads.map(ad => 
      ad.id === adId ? { ...ad, active: !ad.active } : ad
    );
    
    if (saveAds(updatedAds)) {
      toast.success('Advertisement status updated');
    }
  };
  
  // Reorder ads
  const moveAd = (adId: string, direction: 'up' | 'down') => {
    const adIndex = ads.findIndex(ad => ad.id === adId);
    if (
      (direction === 'up' && adIndex === 0) ||
      (direction === 'down' && adIndex === ads.length - 1)
    ) {
      return;
    }
    
    const newAds = [...ads];
    const targetIndex = direction === 'up' ? adIndex - 1 : adIndex + 1;
    
    // Swap ads
    [newAds[adIndex], newAds[targetIndex]] = [newAds[targetIndex], newAds[adIndex]];
    
    // Update order values
    const reorderedAds = newAds.map((ad, index) => ({
      ...ad,
      order: index + 1
    }));
    
    if (saveAds(reorderedAds)) {
      toast.success('Advertisement order updated');
    }
  };
  
  // Open edit dialog
  const openEditDialog = (ad: Ad) => {
    setCurrentAd(ad);
    setNewAdImage(ad.imageUrl);
    setNewAdTitle(ad.title || '');
    setNewAdLink(ad.link || '');
    setNewAdPlacement(ad.placement || 'home');
    setNewAdActive(ad.active !== false);
    setIsEditDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (ad: Ad) => {
    setCurrentAd(ad);
    setIsDeleteDialogOpen(true);
  };

  // Filter ads by placement
  const filterAdsByPlacement = (placement?: 'home' | 'sidebar' | 'product') => {
    if (!placement) return ads;
    return ads.filter(ad => ad.placement === placement);
  };
  
  return (
    <Card className="border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white">
        <CardTitle className="text-xl">إدارة الإعلانات</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">الإعلانات الحالية ({ads.length})</h3>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-green-700 hover:bg-green-800"
          >
            <Plus className="w-4 h-4 mr-2" /> إضافة إعلان جديد
          </Button>
        </div>
        
        {ads.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">لا يوجد إعلانات</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              variant="outline" 
              className="mt-4"
            >
              إضافة الإعلان الأول
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <Label className="mb-2 block">عرض الإعلانات حسب المكان:</Label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="جميع الإعلانات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الإعلانات</SelectItem>
                  <SelectItem value="home">الصفحة الرئيسية</SelectItem>
                  <SelectItem value="sidebar">الشريط الجانبي</SelectItem>
                  <SelectItem value="product">صفحة المنتج</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad, index) => (
                <div key={ad.id} className={`border rounded-md overflow-hidden ${!ad.active ? 'opacity-60' : ''}`}>
                  <AspectRatio ratio={16/9}>
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title || 'Ad'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    {!ad.active && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-md">
                        غير نشط
                      </div>
                    )}
                    {ad.placement && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-md">
                        {ad.placement === 'home' ? 'الرئيسية' : 
                         ad.placement === 'sidebar' ? 'الجانب' : 'المنتج'}
                      </div>
                    )}
                  </AspectRatio>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium truncate">{ad.title || 'إعلان بدون عنوان'}</h4>
                      <div className="flex items-center">
                        <Switch 
                          checked={ad.active !== false}
                          onCheckedChange={() => toggleAdStatus(ad.id)}
                        />
                      </div>
                    </div>
                    {ad.link && ad.link !== '#' && (
                      <p className="text-sm text-blue-600 flex items-center gap-1 truncate mb-2">
                        <Link className="w-4 h-4" />
                        {ad.link}
                      </p>
                    )}
                    <div className="flex justify-between gap-2 mt-2">
                      <div className="space-x-1 rtl:space-x-reverse">
                        {index > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => moveAd(ad.id, 'up')}
                            className="h-8 w-8 p-0"
                          >
                            ↑
                          </Button>
                        )}
                        {index < ads.length - 1 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => moveAd(ad.id, 'down')}
                            className="h-8 w-8 p-0"
                          >
                            ↓
                          </Button>
                        )}
                      </div>
                      <div className="space-x-1 rtl:space-x-reverse">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditDialog(ad)}
                        >
                          <Pencil className="w-4 h-4 mr-1" /> تعديل
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => openDeleteDialog(ad)}
                        >
                          <Trash className="w-4 h-4 mr-1" /> حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Add Ad Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة إعلان جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">صورة الإعلان*</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded"
                />
                {newAdImage && (
                  <div className="mt-2">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={newAdImage} 
                        alt="Ad preview" 
                        className="w-full h-full object-cover rounded"
                      />
                    </AspectRatio>
                  </div>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">عنوان الإعلان</label>
                <input 
                  type="text" 
                  value={newAdTitle}
                  onChange={(e) => setNewAdTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="مثال: عروض الصيف"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">رابط الإعلان</label>
                <input 
                  type="text" 
                  value={newAdLink}
                  onChange={(e) => setNewAdLink(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="مثال: /products/summer-sale"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">مكان الإعلان</label>
                <Select
                  value={newAdPlacement}
                  onValueChange={(value: 'home' | 'sidebar' | 'product') => setNewAdPlacement(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر مكان الإعلان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">الصفحة الرئيسية</SelectItem>
                    <SelectItem value="sidebar">الشريط الجانبي</SelectItem>
                    <SelectItem value="product">صفحة المنتج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Switch 
                  id="ad-status" 
                  checked={newAdActive} 
                  onCheckedChange={setNewAdActive}
                />
                <Label htmlFor="ad-status">فعّال</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsAddDialogOpen(false)} variant="outline">إلغاء</Button>
              <Button onClick={handleAddAd} className="bg-green-700 hover:bg-green-800">إضافة الإعلان</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Ad Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الإعلان</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">صورة الإعلان*</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="flex-1 p-2 border rounded"
                  />
                  {currentAd?.imageUrl && (
                    <a href={currentAd.imageUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
                {newAdImage && (
                  <div className="mt-2">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={newAdImage} 
                        alt="Ad preview" 
                        className="w-full h-full object-cover rounded"
                      />
                    </AspectRatio>
                  </div>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">عنوان الإعلان</label>
                <input 
                  type="text" 
                  value={newAdTitle}
                  onChange={(e) => setNewAdTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="مثال: عروض الصيف"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">رابط الإعلان</label>
                <input 
                  type="text" 
                  value={newAdLink}
                  onChange={(e) => setNewAdLink(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="مثال: /products/summer-sale"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">مكان الإعلان</label>
                <Select
                  value={newAdPlacement}
                  onValueChange={(value: 'home' | 'sidebar' | 'product') => setNewAdPlacement(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر مكان الإعلان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">الصفحة الرئيسية</SelectItem>
                    <SelectItem value="sidebar">الشريط الجانبي</SelectItem>
                    <SelectItem value="product">صفحة المنتج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Switch 
                  id="edit-ad-status" 
                  checked={newAdActive} 
                  onCheckedChange={setNewAdActive}
                />
                <Label htmlFor="edit-ad-status">فعّال</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">إلغاء</Button>
              <Button onClick={handleEditAd} className="bg-green-700 hover:bg-green-800">حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Ad Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حذف الإعلان</DialogTitle>
            </DialogHeader>
            <p>هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <DialogFooter>
              <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">إلغاء</Button>
              <Button onClick={handleDeleteAd} variant="destructive">حذف الإعلان</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdManagement;
