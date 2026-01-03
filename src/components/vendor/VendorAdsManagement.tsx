import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Upload, Image as ImageIcon } from 'lucide-react';

interface VendorAd {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  redirect_url: string | null;
  position: number;
  is_active: boolean;
  vendor_id: string;
}

interface VendorAdsManagementProps {
  vendorId: string;
}

const VendorAdsManagement: React.FC<VendorAdsManagementProps> = ({ vendorId }) => {
  const [ads, setAds] = useState<VendorAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<VendorAd | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [position, setPosition] = useState<'top' | 'mid'>('top');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [vendorId]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('position', { ascending: true });

      if (error) throw error;
      setAds(data || []);
    } catch (error: any) {
      console.error('Error fetching vendor ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setRedirectUrl('');
    setPosition('top');
    setIsActive(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddAd = async () => {
    if (!imageUrl) {
      toast.error('Please add an image');
      return;
    }

    try {
      const positionValue = position === 'top' ? 0 : 10;
      
      const { error } = await supabase
        .from('ads')
        .insert({
          vendor_id: vendorId,
          title,
          description,
          image_url: imageUrl,
          redirect_url: redirectUrl || null,
          position: positionValue,
          is_active: isActive
        });

      if (error) throw error;

      toast.success('Ad added successfully');
      setShowAddDialog(false);
      resetForm();
      fetchAds();
    } catch (error: any) {
      console.error('Error adding ad:', error);
      toast.error('Failed to add ad');
    }
  };

  const handleEditAd = async () => {
    if (!editingAd || !imageUrl) {
      toast.error('Please add an image');
      return;
    }

    try {
      const positionValue = position === 'top' ? 0 : 10;
      
      const { error } = await supabase
        .from('ads')
        .update({
          title,
          description,
          image_url: imageUrl,
          redirect_url: redirectUrl || null,
          position: positionValue,
          is_active: isActive
        })
        .eq('id', editingAd.id)
        .eq('vendor_id', vendorId);

      if (error) throw error;

      toast.success('Ad updated successfully');
      setShowEditDialog(false);
      setEditingAd(null);
      resetForm();
      fetchAds();
    } catch (error: any) {
      console.error('Error updating ad:', error);
      toast.error('Failed to update ad');
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId)
        .eq('vendor_id', vendorId);

      if (error) throw error;

      toast.success('Ad deleted successfully');
      fetchAds();
    } catch (error: any) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  const openEditDialog = (ad: VendorAd) => {
    setEditingAd(ad);
    setTitle(ad.title || '');
    setDescription(ad.description || '');
    setImageUrl(ad.image_url);
    setRedirectUrl(ad.redirect_url || '');
    setPosition(ad.position < 10 ? 'top' : 'mid');
    setIsActive(ad.is_active);
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Store Ads</h2>
          <p className="text-sm text-muted-foreground">
            Manage promotional banners for your store
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Ad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title (optional)</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ad title"
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ad description"
                />
              </div>
              <div>
                <Label>Image *</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="ad-image-upload"
                  />
                  <label
                    htmlFor="ad-image-upload"
                    className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:border-primary transition-colors"
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <Label>Redirect URL (optional)</Label>
                <Input 
                  value={redirectUrl} 
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Position</Label>
                <Select value={position} onValueChange={(v) => setPosition(v as 'top' | 'mid')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top Banner</SelectItem>
                    <SelectItem value="mid">Mid-Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>Active</Label>
              </div>
              <Button onClick={handleAddAd} className="w-full">
                Add Ad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ads List */}
      {ads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Ads Yet</h3>
            <p className="text-sm text-muted-foreground">
              Add promotional banners to attract customers
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ads.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={ad.image_url} 
                    alt={ad.title || 'Ad'} 
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{ad.title || 'Untitled Ad'}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded text-xs ${ad.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span>•</span>
                      <span>{ad.position < 10 ? 'Top' : 'Mid-Page'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(ad)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteAd(ad.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title (optional)</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ad title"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ad description"
              />
            </div>
            <div>
              <Label>Image *</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="ad-image-edit"
                />
                <label
                  htmlFor="ad-image-edit"
                  className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:border-primary transition-colors"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div>
              <Label>Redirect URL (optional)</Label>
              <Input 
                value={redirectUrl} 
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Position</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as 'top' | 'mid')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top Banner</SelectItem>
                  <SelectItem value="mid">Mid-Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>
            <Button onClick={handleEditAd} className="w-full">
              Update Ad
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorAdsManagement;
