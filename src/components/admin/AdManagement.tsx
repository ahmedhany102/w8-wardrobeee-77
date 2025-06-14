import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash, Pencil, Plus, Image, Link as LinkIcon, ExternalLink, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';

interface Ad {
  id: string;
  imageUrl: string;
  link?: string;
  title?: string;
  placement?: 'home' | 'sidebar' | 'product';
  active: boolean;
  order?: number;
  productId?: string;
  imageCrop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  responsiveSize?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  mainImage?: string;
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
  const [newAdProductId, setNewAdProductId] = useState<string>('');
  const [filterPlacement, setFilterPlacement] = useState<string>('all');
  const [newAdResponsiveSize, setNewAdResponsiveSize] = useState({ desktop: 100, tablet: 100, mobile: 100 });
  
  // Use Supabase products hook instead of ProductDatabase
  const { products } = useSupabaseProducts();
  
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
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
      order: ads.length + 1,
      productId: newAdProductId,
      responsiveSize: newAdResponsiveSize
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
      setNewAdProductId('');
      setNewAdResponsiveSize({ desktop: 100, tablet: 100, mobile: 100 });
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
      active: newAdActive,
      productId: newAdProductId,
      responsiveSize: newAdResponsiveSize
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
      setNewAdProductId('');
      setNewAdResponsiveSize({ desktop: 100, tablet: 100, mobile: 100 });
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
    setNewAdProductId(ad.productId || '');
    setNewAdResponsiveSize(ad.responsiveSize || { desktop: 100, tablet: 100, mobile: 100 });
    setIsEditDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (ad: Ad) => {
    setCurrentAd(ad);
    setIsDeleteDialogOpen(true);
  };

  // Handle product selection for ad linking
  const handleProductSelect = (productId: string) => {
    setNewAdProductId(productId);
    
    // If product selected, automatically set link to product page
    if (productId) {
      setNewAdLink(`/product/${productId}`);
    }
  };

  // Get product name by ID
  const getProductNameById = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Filter ads by placement
  const filteredAds = ads.filter(ad => {
    if (filterPlacement === 'all') return true;
    return ad.placement === filterPlacement;
  });
  
  return (
    <Card className="border-green-100">
      <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white">
        <CardTitle className="text-xl">Ad Management</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Current Ads ({ads.length})</h3>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-green-700 hover:bg-green-800"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Ad
          </Button>
        </div>
        
        {ads.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No ads available</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              variant="outline" 
              className="mt-4"
            >
              Add First Ad
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <Label className="mb-2 block">Filter Ads by Placement:</Label>
              <Select value={filterPlacement} onValueChange={setFilterPlacement}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Ads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ads</SelectItem>
                  <SelectItem value="home">Home Page</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                  <SelectItem value="product">Product Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAds.map((ad, index) => (
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
                        Inactive
                      </div>
                    )}
                    {ad.placement && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-md">
                        {ad.placement === 'home' ? 'Home' : 
                         ad.placement === 'sidebar' ? 'Sidebar' : 'Product'}
                      </div>
                    )}
                  </AspectRatio>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium truncate">{ad.title || 'Untitled Ad'}</h4>
                      <div className="flex items-center">
                        <Switch 
                          checked={ad.active !== false}
                          onCheckedChange={() => toggleAdStatus(ad.id)}
                        />
                      </div>
                    </div>
                    {ad.link && ad.link !== '#' && (
                      <p className="text-sm text-blue-600 flex items-center gap-1 truncate mb-2">
                        <LinkIcon className="w-4 h-4" />
                        {ad.link}
                      </p>
                    )}
                    {ad.productId && (
                      <p className="text-sm text-green-600 flex items-center gap-1 truncate mb-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Linked to: {getProductNameById(ad.productId)}
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
                        {index < filteredAds.length - 1 && (
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
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => openDeleteDialog(ad)}
                        >
                          <Trash className="w-4 h-4 mr-1" /> Delete
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Ad</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="product">Product Link</TabsTrigger>
                <TabsTrigger value="responsive">Responsive Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div>
                  <label className="block font-medium mb-1">Ad Image*</label>
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
                  <label className="block font-medium mb-1">Ad Title</label>
                  <Input 
                    type="text" 
                    value={newAdTitle}
                    onChange={(e) => setNewAdTitle(e.target.value)}
                    placeholder="Example: Summer Sale"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Ad Link</label>
                  <Input 
                    type="text" 
                    value={newAdLink}
                    onChange={(e) => setNewAdLink(e.target.value)}
                    placeholder="Example: /products/summer-sale"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Ad Placement</label>
                  <Select
                    value={newAdPlacement}
                    onValueChange={(value: 'home' | 'sidebar' | 'product') => setNewAdPlacement(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose ad placement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Page</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="product">Product Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch 
                    id="ad-status" 
                    checked={newAdActive} 
                    onCheckedChange={setNewAdActive}
                  />
                  <Label htmlFor="ad-status">Active</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="product" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Link to Product</label>
                    <p className="text-sm text-gray-500 mb-2">
                      Select a product to link this ad to. The ad will redirect to the selected product page.
                    </p>
                    
                    <Select value={newAdProductId} onValueChange={handleProductSelect}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="">None</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {newAdProductId && (
                      <div className="mt-4 p-3 border rounded bg-gray-50">
                        <p className="font-medium">Selected Product:</p>
                        <p>{getProductNameById(newAdProductId)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ad will link to: /product/{newAdProductId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="responsive" className="mt-4">
                <div className="space-y-6">
                  <div>
                    <label className="block font-medium mb-2">Desktop Size (%)</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={20}
                        max={100}
                        step={1}
                        value={[newAdResponsiveSize.desktop]}
                        onValueChange={(values) => setNewAdResponsiveSize({...newAdResponsiveSize, desktop: values[0]})}
                        className="flex-grow"
                      />
                      <span className="w-12 text-center">{newAdResponsiveSize.desktop}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Tablet Size (%)</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={20}
                        max={100}
                        step={1}
                        value={[newAdResponsiveSize.tablet]}
                        onValueChange={(values) => setNewAdResponsiveSize({...newAdResponsiveSize, tablet: values[0]})}
                        className="flex-grow"
                      />
                      <span className="w-12 text-center">{newAdResponsiveSize.tablet}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Mobile Size (%)</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={20}
                        max={100}
                        step={1}
                        value={[newAdResponsiveSize.mobile]}
                        onValueChange={(values) => setNewAdResponsiveSize({...newAdResponsiveSize, mobile: values[0]})}
                        className="flex-grow"
                      />
                      <span className="w-12 text-center">{newAdResponsiveSize.mobile}%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-600 mb-2">
                      These settings control how large the ad appears on different devices:
                    </p>
                    <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
                      <li>Desktop: screens larger than 1024px</li>
                      <li>Tablet: screens between 768px and 1024px</li>
                      <li>Mobile: screens smaller than 768px</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button onClick={() => setIsAddDialogOpen(false)} variant="outline">Cancel</Button>
              <Button onClick={handleAddAd} className="bg-green-700 hover:bg-green-800">Add Ad</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Ad Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Ad</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="product">Product Link</TabsTrigger>
                <TabsTrigger value="responsive">Responsive Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div>
                  <label className="block font-medium mb-1">Ad Image*</label>
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
                  <label className="block font-medium mb-1">Ad Title</label>
                  <Input 
                    type="text" 
                    value={newAdTitle}
                    onChange={(e) => setNewAdTitle(e.target.value)}
                    placeholder="Example: Summer Sale"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Ad Link</label>
                  <Input 
                    type="text" 
                    value={newAdLink}
                    onChange={(e) => setNewAdLink(e.target.value)}
                    placeholder="Example: /products/summer-sale"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Ad Placement</label>
                  <Select
                    value={newAdPlacement}
                    onValueChange={(value: 'home' | 'sidebar' | 'product') => setNewAdPlacement(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose ad placement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Page</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="product">Product Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch 
                    id="edit-ad-status" 
                    checked={newAdActive} 
                    onCheckedChange={setNewAdActive}
                  />
                  <Label htmlFor="edit-ad-status">Active</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="product" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Link to Product</label>
                    <p className="text-sm text-gray-500 mb-2">
                      Select a product to link this ad to. The ad will redirect to the selected product page.
                    </p>
                    
                    <Select value={newAdProductId} onValueChange={handleProductSelect}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="">None</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {newAdProductId && (
                      <div className="mt-4 p-3 border rounded bg-gray-50">
                        <p className="font-medium">Selected Product:</p>
                        <p>{getProductNameById(newAdProductId)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ad will link to: /product/{newAdProductId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="responsive" className="mt-4">
                <div className="space-y-6">
                  <div>
                    <label className="block font-medium mb-2">Desktop Size (%)</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={20}
                        max={100}
                        step={1}
                        value={[newAdResponsiveSize.desktop]}
                        onValueChange={(values) => setNewAdResponsiveSize({...newAdResponsiveSize, desktop: values[0]})}
                        className="flex-grow"
                      />
                      <span className="w-12 text-center">{newAdResponsiveSize.desktop}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Tablet Size (%)</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={20}
                        max={100}
                        step={1}
                        value={[newAdResponsiveSize.tablet]}
                        onValueChange={(values) => setNewAdResponsiveSize({...newAdResponsiveSize, tablet: values[0]})}
                        className="flex-grow"
                      />
                      <span className="w-12 text-center">{newAdResponsiveSize.tablet}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-2">Mobile Size (%)</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={20}
                        max={100}
                        step={1}
                        value={[newAdResponsiveSize.mobile]}
                        onValueChange={(values) => setNewAdResponsiveSize({...newAdResponsiveSize, mobile: values[0]})}
                        className="flex-grow"
                      />
                      <span className="w-12 text-center">{newAdResponsiveSize.mobile}%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-600 mb-2">
                      These settings control how large the ad appears on different devices:
                    </p>
                    <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
                      <li>Desktop: screens larger than 1024px</li>
                      <li>Tablet: screens between 768px and 1024px</li>
                      <li>Mobile: screens smaller than 768px</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">Cancel</Button>
              <Button onClick={handleEditAd} className="bg-green-700 hover:bg-green-800">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Ad Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Ad</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this ad? This action cannot be undone.</p>
            <DialogFooter>
              <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">Cancel</Button>
              <Button onClick={handleDeleteAd} variant="destructive">Delete Ad</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdManagement;
