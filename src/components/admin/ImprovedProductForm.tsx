
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SizeManager from './SizeManager';
import ImageUploader from './ImageUploader';
import { Product, SizeWithStock } from '@/models/Product';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, "id">) => void;
  submitLabel: string;
  onCancel: () => void;
  predefinedCategories?: string[];
  predefinedTypes?: string[];
  allowSizesWithoutColors?: boolean;
}

const ImprovedProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  submitLabel,
  onCancel,
  predefinedCategories = ['Men'],
  predefinedTypes = ['T-Shirts', 'Trousers', 'Shoes', 'Jackets'],
  allowSizesWithoutColors = true
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '0');
  const [category, setCategory] = useState(initialData?.category || 'Men');
  const [type, setType] = useState(initialData?.type || 'T-Shirts');
  const [inventory, setInventory] = useState(initialData?.inventory?.toString() || '0');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [hasDiscount, setHasDiscount] = useState(initialData?.hasDiscount || false);
  const [discount, setDiscount] = useState(initialData?.discount?.toString() || '0');
  const [stock, setStock] = useState(initialData?.stock?.toString() || '0');
  const [details, setDetails] = useState(initialData?.details || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [mainImage, setMainImage] = useState<string>(initialData?.mainImage || '');
  const [colors, setColors] = useState<string[]>(initialData?.colors || []);
  const [sizes, setSizes] = useState<SizeWithStock[]>(initialData?.sizes || []);

  useEffect(() => {
    if (!mainImage && images.length > 0) {
      setMainImage(images[0]);
    }
  }, [images, mainImage]);

  // Since we're forcing "Men" as the only category
  useEffect(() => {
    setCategory('Men');
  }, []);

  const handleImageUpload = (imageUrl: string) => {
    setImages([...images, imageUrl]);
    if (!mainImage) {
      setMainImage(imageUrl);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    if (mainImage === images[index]) {
      setMainImage(newImages[0] || '');
    }
  };

  const setAsMainImage = (index: number) => {
    setMainImage(images[index]);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const colorInput = e.target.value.trim();
    if (colorInput) {
      const colorArray = colorInput.split(',').map(c => c.trim()).filter(c => c);
      setColors(colorArray);
    } else {
      setColors([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Omit<Product, "id"> = {
      name,
      description,
      price: parseFloat(price) || 0,
      category: 'Men', // Always set to "Men"
      type,
      inventory: parseInt(inventory) || 0,
      featured,
      discount: hasDiscount ? parseFloat(discount) || 0 : 0,
      images,
      sizes,
      hasDiscount,
      stock: parseInt(stock) || 0,
      mainImage,
      colors,
      details,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input 
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Product name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">Price (EGP)</Label>
          <Input 
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Price"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Product description"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <select 
            id="type"
            value={type}
            onChange={e => setType(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
          >
            {predefinedTypes.map(typeOption => (
              <option key={typeOption} value={typeOption}>{typeOption}</option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input 
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={e => setStock(e.target.value)}
            placeholder="Stock quantity"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="featured"
          checked={featured}
          onCheckedChange={checked => setFeatured(checked as boolean)}
        />
        <Label htmlFor="featured">Featured Product</Label>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasDiscount"
            checked={hasDiscount}
            onCheckedChange={checked => setHasDiscount(checked as boolean)}
          />
          <Label htmlFor="hasDiscount">Has Discount</Label>
        </div>
        
        {hasDiscount && (
          <div>
            <Label htmlFor="discount">Discount Percentage (%)</Label>
            <Input 
              id="discount"
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              placeholder="Discount percentage"
            />
          </div>
        )}
      </div>
      
      <div>
        <Label htmlFor="details">Additional Details</Label>
        <Textarea 
          id="details"
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder="Additional product details"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="colors">Colors (comma-separated)</Label>
        <Input 
          id="colors"
          value={colors.join(', ')}
          onChange={handleColorChange}
          placeholder="Red, Blue, Green"
        />
      </div>
      
      <Card>
        <CardContent className="pt-4">
          <Label>Sizes &amp; Stock</Label>
          <SizeManager 
            sizes={sizes} 
            onChange={setSizes}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-4">
          <Label>Product Images</Label>
          <div className="mt-2">
            <ImageUploader onChange={(imgs: string[]) => {
              setImages(imgs);
              if (imgs.length > 0 && !mainImage) {
                setMainImage(imgs[0]);
              }
            }} value={images} />
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image} 
                    alt={`Product ${index}`} 
                    className={`h-24 w-full object-cover rounded ${mainImage === image ? 'ring-2 ring-green-600' : ''}`} 
                  />
                  <div className="absolute top-0 right-0 space-x-1 bg-white bg-opacity-70 p-1 rounded">
                    <button 
                      type="button"
                      onClick={() => setAsMainImage(index)}
                      className="text-xs hover:text-green-600"
                    >
                      Main
                    </button>
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-xs hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ImprovedProductForm;
