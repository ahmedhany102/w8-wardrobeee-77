
import React, { useState } from 'react';
import { useSupabaseAds } from '@/hooks/useSupabaseAds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';

const AdManagement = () => {
  const { ads, loading, addAd, updateAd, deleteAd } = useSupabaseAds();
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    redirect_url: '',
    description: '',
    position: '0',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAd) {
      await updateAd(editingAd.id, formData);
    } else {
      await addAd(formData);
    }
    
    setShowForm(false);
    setEditingAd(null);
    setFormData({
      title: '',
      image_url: '',
      redirect_url: '',
      description: '',
      position: '0',
      is_active: true
    });
  };

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      image_url: ad.image_url || '',
      redirect_url: ad.redirect_url || '',
      description: ad.description || '',
      position: ad.position.toString(),
      is_active: ad.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      await deleteAd(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="p-6">Loading ads...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ad Management</h2>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Ad
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingAd ? 'Edit Ad' : 'Add New Ad'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter ad title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Display position"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded"
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded" />
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Redirect URL</label>
              <Input
                value={formData.redirect_url}
                onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                placeholder="Where should this ad link to?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Ad description"
              />
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
                {editingAd ? 'Update' : 'Create'} Ad
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingAd(null);
                  setFormData({
                    title: '',
                    image_url: '',
                    redirect_url: '',
                    description: '',
                    position: '0',
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
        {ads.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No ads found. Create your first ad!</p>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex space-x-4 flex-1">
                  {ad.image_url && (
                    <img src={ad.image_url} alt={ad.title} className="h-20 w-32 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{ad.title || 'Untitled Ad'}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${ad.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {ad.description && (
                      <p className="text-gray-600 text-sm mb-2">{ad.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Position: {ad.position}</span>
                      {ad.redirect_url && (
                        <a href={ad.redirect_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                          <ExternalLink className="w-3 h-3" />
                          <span>View Link</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(ad)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(ad.id)}
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

export default AdManagement;
