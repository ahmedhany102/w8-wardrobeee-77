
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash, Pencil, Plus, Image, Link, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Ad {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
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
  
  // Load ads from localStorage
  useEffect(() => {
    const storedAds = localStorage.getItem('homeAds');
    if (storedAds) {
      try {
        setAds(JSON.parse(storedAds));
      } catch (error) {
        console.error('Error parsing ads:', error);
      }
    }
  }, []);
  
  // Save ads to localStorage
  const saveAds = (updatedAds: Ad[]) => {
    try {
      localStorage.setItem('homeAds', JSON.stringify(updatedAds));
      setAds(updatedAds);
    } catch (error) {
      console.error('Error saving ads:', error);
      toast.error('فشل في حفظ الإعلانات');
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      toast.error('يرجى تحميل صورة للإعلان');
      return;
    }
    
    const newAd: Ad = {
      id: `ad-${Date.now()}`,
      imageUrl: newAdImage,
      title: newAdTitle,
      link: newAdLink || '#'
    };
    
    const updatedAds = [...ads, newAd];
    saveAds(updatedAds);
    toast.success('تم إضافة الإعلان بنجاح');
    
    // Reset form
    setNewAdImage('');
    setNewAdTitle('');
    setNewAdLink('');
    setIsAddDialogOpen(false);
  };
  
  // Edit ad
  const handleEditAd = () => {
    if (!currentAd) return;
    
    const updatedAd = {
      ...currentAd,
      imageUrl: newAdImage || currentAd.imageUrl,
      title: newAdTitle,
      link: newAdLink || '#'
    };
    
    const updatedAds = ads.map(ad => ad.id === currentAd.id ? updatedAd : ad);
    saveAds(updatedAds);
    toast.success('تم تحديث الإعلان بنجاح');
    
    // Reset form
    setIsEditDialogOpen(false);
    setCurrentAd(null);
    setNewAdImage('');
    setNewAdTitle('');
    setNewAdLink('');
  };
  
  // Delete ad
  const handleDeleteAd = () => {
    if (!currentAd) return;
    
    const updatedAds = ads.filter(ad => ad.id !== currentAd.id);
    saveAds(updatedAds);
    toast.success('تم حذف الإعلان بنجاح');
    
    setIsDeleteDialogOpen(false);
    setCurrentAd(null);
  };
  
  // Open edit dialog
  const openEditDialog = (ad: Ad) => {
    setCurrentAd(ad);
    setNewAdImage(ad.imageUrl);
    setNewAdTitle(ad.title || '');
    setNewAdLink(ad.link || '');
    setIsEditDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (ad: Ad) => {
    setCurrentAd(ad);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <Card className="border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white">
        <CardTitle className="text-xl">إدارة إعلانات الصفحة الرئيسية</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="border rounded-md overflow-hidden">
                <AspectRatio ratio={16/9}>
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title || 'Ad'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </AspectRatio>
                <div className="p-3">
                  <h4 className="font-medium truncate">{ad.title || 'إعلان بدون عنوان'}</h4>
                  {ad.link && ad.link !== '#' && (
                    <p className="text-sm text-blue-600 flex items-center gap-1 truncate">
                      <Link className="w-4 h-4" />
                      {ad.link}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 mt-2">
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
            ))}
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
