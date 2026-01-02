import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { Trash2, Plus, Edit, Eye, EyeOff, Upload, X, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CategoryManagement = () => {
  const { categories, mainCategories, subcategories, loading, refetch } = useCategories();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setSlug("");
    setParentId("none");
    setIsActive(true);
    setSortOrder(0);
    setImageUrl(null);
    setImagePreview(null);
  };

  // Generate slug when name changes
  const generateSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to Supabase storage
  const uploadImage = async (): Promise<string | null> => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return imageUrl; // Return existing URL if no new file

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If bucket doesn't exist, use base64
        console.error('Storage upload failed:', uploadError);
        return imagePreview; // Fallback to base64
      }

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return imagePreview; // Fallback to base64
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add category
  const handleAddCategory = async () => {
    if (!name.trim()) return toast.error("Category name is required");

    const categorySlug = slug || generateSlug(name);
    const finalImageUrl = await uploadImage();

    const { error } = await supabase
      .from('categories')
      .insert([{
        name: name.trim(),
        slug: categorySlug,
        parent_id: parentId === "none" ? null : parentId || null,
        is_active: isActive,
        sort_order: sortOrder,
        description: "",
        image_url: finalImageUrl
      }]);
    if (error) {
      toast.error('Failed to add category: ' + error.message);
      return;
    }
    toast.success('Category added successfully!');
    setShowAddDialog(false);
    resetForm();
    refetch();
  };

  // Edit category
  const handleEditCategory = async () => {
    if (!editingCategory || !name.trim()) return toast.error("Category name is required");

    const categorySlug = slug || generateSlug(name);
    const finalImageUrl = await uploadImage();

    const { error } = await supabase
      .from('categories')
      .update({
        name: name.trim(),
        slug: categorySlug,
        parent_id: parentId === "none" ? null : parentId || null,
        is_active: isActive,
        sort_order: sortOrder,
        image_url: finalImageUrl
      })
      .eq('id', editingCategory.id);

    if (error) {
      toast.error('Failed to update category: ' + error.message);
      return;
    }
    toast.success('Category updated successfully!');
    setShowEditDialog(false);
    setEditingCategory(null);
    resetForm();
    refetch();
  };

  // Delete category
  const handleDeleteCategory = async (id: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete category: ' + error.message);
      return;
    }
    toast.success('Category deleted successfully!');
    refetch();
  };

  // Open edit dialog
  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setName(category.name || "");
    setSlug(category.slug || "");
    setParentId(category.parent_id || "none");
    setIsActive(category.is_active);
    setSortOrder(category.sort_order || 0);
    setImageUrl(category.image_url || null);
    setImagePreview(category.image_url || null);
    setShowEditDialog(true);
  };

  // Image upload component
  const ImageUploadField = () => (
    <div className="space-y-2">
      <Label>Category Image</Label>
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted">
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        {/* Upload button */}
        <div className="flex-1 space-y-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Recommended: Square image, max 5MB
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => { setName(e.target.value); if (!slug) setSlug(generateSlug(e.target.value)); }}
                  required
                  placeholder="e.g. T-Shirts, Shoes, Electronics"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL-friendly)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. t-shirts, shoes"
                />
              </div>
              
              <ImageUploadField />
              
              <div>
                <Label htmlFor="parentId">Parent Category (Optional)</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger><SelectValue placeholder="Select parent category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Main Category)</SelectItem>
                    {mainCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input id="sortOrder" type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} min="0" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleAddCategory} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Add Category'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {categories.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No categories found. Click "Add New Category".</CardContent></Card>
        ) : (
          categories.map(category => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    {/* Category Image */}
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {category.parent_id && "↳ "}
                        {category.name}
                        {category.is_active ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground mt-1 space-y-1">
                        <p><strong>Slug:</strong> {category.slug}</p>
                        {category.parent_id && <p><strong>Parent:</strong> {categories.find(c => c.id === category.parent_id)?.name || "Unknown"}</p>}
                        <p><strong>Subcategories:</strong> {subcategories(category.id).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id, category.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div><strong>Sort Order:</strong> {category.sort_order}</div>
                  <div><strong>Status:</strong> {category.is_active ? "Active" : "Inactive"}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) { setEditingCategory(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Category name"
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug (URL-friendly)</Label>
              <Input
                id="edit-slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="category-slug"
              />
            </div>
            
            <ImageUploadField />
            
            <div>
              <Label htmlFor="edit-parentId">Parent Category (Optional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger><SelectValue placeholder="Select parent category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Main Category)</SelectItem>
                  {mainCategories.filter(c => c.id !== editingCategory?.id).map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-sortOrder">Sort Order</Label>
              <Input
                id="edit-sortOrder"
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="edit-isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingCategory(null); resetForm(); }}>Cancel</Button>
              <Button onClick={handleEditCategory} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Update Category'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default CategoryManagement;