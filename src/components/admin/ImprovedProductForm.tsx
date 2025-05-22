import React, { useState, useEffect, useCallback } from "react";
import { Product, SizeWithStock } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (product: Omit<Product, "id">) => Promise<void>;
  submitLabel: string;
  onCancel: () => void;
  subcategories?: string[]; // Changed from 'categories' to 'subcategories'
}

// Define a local Size interface that includes both id and price
interface Size {
  id: string;
  size: string;
  stock: number;
  price?: number;
}

const ImprovedProductForm: React.FC<ProductFormProps> = ({ 
  initialData, 
  onSubmit, 
  submitLabel, 
  onCancel,
  subcategories = ["T-shirts", "Pants", "Shoes", "Jackets"]  // Changed parameter name to match interface
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price || 0);
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  const [hasDiscount, setHasDiscount] = useState(initialData?.hasDiscount || false);
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [mainImage, setMainImage] = useState(initialData?.mainImage || "");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [type, setType] = useState(initialData?.type || "T-shirts");
  const [category, setCategory] = useState(initialData?.category || "Men");
  
  // Convert from SizeWithStock[] to our local Size[] interface when initializing
  const [sizes, setSizes] = useState<Size[]>(
    initialData?.sizes 
      ? initialData.sizes.map(s => ({
          id: uuidv4(), // Generate a new id for each size
          size: s.size,
          stock: s.stock,
          price: s.price
        }))
      : []
  );
  
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState(0);
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newImage, setNewImage] = useState('');

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
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImage = () => {
    if (!newImage) {
      toast.error('Please upload an image');
      return;
    }

    setImages([...images, newImage]);
    setNewImage('');
  };

  const removeImage = (imageToRemove: string) => {
    setImages(images.filter(image => image !== imageToRemove));
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSize = () => {
    if (!newSize || newStock < 0) {
      toast.error("Please enter a valid size and stock");
      return;
    }

    const newSizeObj: Size = {
      id: uuidv4(),
      size: newSize,
      stock: newStock,
      price: price // Use the main product price for each size
    };

    setSizes([...sizes, newSizeObj]);
    setNewSize("");
    setNewStock(0);
		setIsAddingSize(false);
  };

  const handleRemoveSize = (id: string) => {
    setSizes(sizes.filter(size => size.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || price < 0) {
      toast.error("Please fill in all required fields with valid values.");
      return;
    }

    // Convert local Size[] to SizeWithStock[] format required by the Product interface
    const sizesWithPrice: SizeWithStock[] = sizes.map(size => ({
      size: size.size,
      stock: size.stock,
      price: size.price || price, // Use size-specific price or fall back to main price
    }));

    const productData: Omit<Product, "id"> = {
      name,
      description,
      price: Number(price),
      discount: hasDiscount ? Number(discount) : 0,
      hasDiscount,
      stock: sizes.length > 0 ? sizes.reduce((total, size) => total + size.stock, 0) : Number(stock),
      mainImage,
      images,
      type,
      category,
      sizes: sizesWithPrice,
      // Add required Product properties
      inventory: Number(stock),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : 0)}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="hasDiscount" checked={hasDiscount} onCheckedChange={setHasDiscount} />
        <Label htmlFor="hasDiscount">Has Discount?</Label>
      </div>

      {hasDiscount && (
        <div>
          <Label htmlFor="discount">Discount (%)</Label>
          <Input
            type="number"
            id="discount"
            value={discount}
            onChange={(e) => setDiscount(e.target.value ? parseFloat(e.target.value) : 0)}
          />
        </div>
      )}

      <div>
        <Label htmlFor="type">Subcategory</Label>
        <Select
          defaultValue={type}
          onValueChange={setType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((subcat) => (
              <SelectItem key={subcat} value={subcat}>
                {subcat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="mainImage">Main Image</Label>
				<div className="flex items-center gap-2">
					<input 
						type="file" 
						accept="image/*" 
						onChange={handleMainImageUpload}
						className="w-full p-2 border rounded"
					/>
					{mainImage && (
						<a href={mainImage} target="_blank" rel="noopener noreferrer">
							<Button variant="outline" size="sm">
								View Image
							</Button>
						</a>
					)}
				</div>
        {mainImage && (
          <div className="mt-2">
            <AspectRatio ratio={16/9}>
              <img src={mainImage} alt="Main Image Preview" className="w-full h-full object-cover rounded" />
            </AspectRatio>
          </div>
        )}
      </div>

			<div>
				<Label htmlFor="images">Other Images</Label>
				<div className="flex items-center gap-2">
					<input 
						type="file" 
						accept="image/*" 
						onChange={handleImageUpload}
						className="w-full p-2 border rounded"
					/>
					<Button type="button" onClick={addImage} className="bg-blue-500 text-white rounded px-4 py-2">
						Add Image
					</Button>
				</div>
				{newImage && (
					<div className="mt-2">
						<AspectRatio ratio={16/9}>
							<img src={newImage} alt="New Image Preview" className="w-full h-full object-cover rounded" />
						</AspectRatio>
					</div>
				)}
				<div className="flex flex-wrap gap-2 mt-2">
					{images.map((image, index) => (
						<div key={index} className="relative">
							<AspectRatio ratio={16/9}>
								<img src={image} alt={`Product Image ${index + 1}`} className="w-32 h-24 object-cover rounded" />
							</AspectRatio>
							<Button
								onClick={() => removeImage(image)}
								className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 -translate-y-1/2 translate-x-1/2 shadow-md"
								size="icon"
							>
								<Trash className="w-4 h-4" />
							</Button>
						</div>
					))}
				</div>
			</div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          disabled // Always keep it as "Men"
        />
      </div>

			<div>
				<Label>Sizes and Stock</Label>
				<div className="space-y-2">
					{sizes.map((size) => (
						<div key={size.id} className="flex items-center space-x-2">
							<div className="flex-grow">
								<Input
									type="text"
									value={size.size}
									readOnly
								/>
							</div>
							<div className="flex-grow">
								<Input
									type="number"
									value={size.stock}
									readOnly
								/>
							</div>
							<Button
								type="button"
								onClick={() => handleRemoveSize(size.id)}
								variant="destructive"
								size="sm"
							>
								<Trash className="h-4 w-4" />
							</Button>
						</div>
					))}
					{!isAddingSize ? (
						<Button type="button" onClick={() => setIsAddingSize(true)} variant="outline">
							<Plus className="h-4 w-4 mr-2" />
							Add Size
						</Button>
					) : (
						<div className="flex items-center space-x-2">
							<div className="flex-grow">
								<Input
									type="text"
									placeholder="Size (e.g., S, M, L)"
									value={newSize}
									onChange={(e) => setNewSize(e.target.value)}
								/>
							</div>
							<div className="flex-grow">
								<Input
									type="number"
									placeholder="Stock"
									value={newStock}
									onChange={(e) => setNewStock(e.target.value ? parseInt(e.target.value) : 0)}
								/>
							</div>
							<Button
								type="button"
								onClick={handleAddSize}
								className="bg-green-500 text-white rounded px-4 py-2"
							>
								Add
							</Button>
							<Button
								type="button"
								onClick={() => setIsAddingSize(false)}
								variant="ghost"
							>
								Cancel
							</Button>
						</div>
					)}
				</div>
			</div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default ImprovedProductForm;
