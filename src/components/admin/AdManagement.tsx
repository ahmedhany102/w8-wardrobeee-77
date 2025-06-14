import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSupabaseAds } from "@/hooks/useSupabaseAds";
import { toast } from "sonner";
import { Trash2, Plus, Edit, Eye, EyeOff } from "lucide-react";

const AdManagement = () => {
  // FIXED: Use the proper hook methods
  const { ads, loading, deleteAd, addAd, updateAd, refetch } = useSupabaseAds();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [position, setPosition] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setRedirectUrl("");
    setPosition(0);
    setIsActive(true);
  };

  const handleAddAd = async () => {
    if (!imageUrl.trim()) {
      toast.error("Image URL is required");
      return;
    }

    const success = await addAd({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      image_url: imageUrl.trim(),
      redirect_url: redirectUrl.trim() || undefined,
      position,
      is_active: isActive
    });

    if (success) {
      setShowAddDialog(false);
      resetForm();
    }
  };

  const handleEditAd = async () => {
    if (!editingAd || !imageUrl.trim()) {
      toast.error("Image URL is required");
      return;
    }

    const success = await updateAd(editingAd.id, {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      image_url: imageUrl.trim(),
      redirect_url: redirectUrl.trim() || undefined,
      position,
      is_active: isActive
    });

    if (success) {
      setShowEditDialog(false);
      setEditingAd(null);
      resetForm();
    }
  };

  // FIXED: Use the deleteAd function from the hook
  const handleDeleteAd = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this advertisement?")) {
      const success = await deleteAd(id);
      if (success) {
        console.log('✅ Advertisement deleted from admin panel');
      }
    }
  };

  const openEditDialog = (ad: any) => {
    setEditingAd(ad);
    setTitle(ad.title || "");
    setDescription(ad.description || "");
    setImageUrl(ad.image_url || "");
    setRedirectUrl(ad.redirect_url || "");
    setPosition(ad.position || 0);
    setIsActive(ad.is_active);
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advertisement Management</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add New Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Advertisement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Advertisement title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Advertisement description"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="redirectUrl">Redirect URL (Optional)</Label>
                <Input
                  id="redirectUrl"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAd}>Add Advertisement</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {ads.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No advertisements found. Click "Add New Ad" to create your first advertisement.
            </CardContent>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {ad.title || "Untitled Advertisement"}
                      {ad.is_active ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </CardTitle>
                    {ad.description && (
                      <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(ad)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={ad.image_url}
                      alt={ad.title || "Advertisement"}
                      className="w-32 h-20 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-sm">
                    <div><strong>Position:</strong> {ad.position}</div>
                    <div><strong>Status:</strong> {ad.is_active ? "Active" : "Inactive"}</div>
                    {ad.redirect_url && (
                      <div><strong>Redirect:</strong> <a href={ad.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{ad.redirect_url}</a></div>
                    )}
                    <div><strong>Created:</strong> {new Date(ad.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Advertisement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title (Optional)</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Advertisement title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Advertisement description"
              />
            </div>
            <div>
              <Label htmlFor="edit-imageUrl">Image URL *</Label>
              <Input
                id="edit-imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-redirectUrl">Redirect URL (Optional)</Label>
              <Input
                id="edit-redirectUrl"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-position">Position</Label>
              <Input
                id="edit-position"
                type="number"
                value={position}
                onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingAd(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditAd}>Update Advertisement</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdManagement;
