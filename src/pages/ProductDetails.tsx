
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '@/models/Product';
import ProductDatabase from '@/models/Product';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Common color names to hex colors mapping
const colorMap: Record<string, string> = {
  'أحمر': '#ff0000',
  'أزرق': '#0074D9',
  'أسود': '#111111',
  'أبيض': '#ffffff',
  'أخضر': '#2ECC40',
  'أصفر': '#FFDC00',
  'رمادي': '#AAAAAA',
  'وردي': '#FF69B4',
  'بنفسجي': '#B10DC9',
  'بني': '#8B4513',
};

// Add missing type for colorSizes
type SizeInfo = {
  size: string;
  stock: number;
  price: number;
};

// Augment Product type with needed properties
declare module '@/models/Product' {
  interface Product {
    colorSizes?: Record<string, SizeInfo[]>;
    originalPrice?: number;
    sku?: string;
  }
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    const fetchProduct = async () => {
      const db = ProductDatabase.getInstance();
      const foundProduct = await db.getProductById(id);
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Set up color-based images mapping if available
        const colorImagesMap: Record<string, string[]> = {};
        
        if (foundProduct.colorImages && Object.keys(foundProduct.colorImages).length > 0) {
          // If we have specific images for each color
          setColorImages(foundProduct.colorImages);
          
          // Set default color and its images
          const defaultColor = Object.keys(foundProduct.colorImages)[0];
          setSelectedColor(defaultColor);
          setActiveImage(foundProduct.colorImages[defaultColor][0] || foundProduct.mainImage || '/placeholder.svg');
        } else {
          // If we don't have color-specific images, use the general product images
          setActiveImage(foundProduct.mainImage || (foundProduct.images && foundProduct.images[0]) || '/placeholder.svg');
        }
        
        // Find the first available size
        if (foundProduct.sizes && foundProduct.sizes.length > 0) {
          const availableSize = foundProduct.sizes.find(size => size && size.stock > 0);
          if (availableSize) {
            setSelectedSize(availableSize.size);
          }
        }
        
        setLoading(false);
      } else {
        navigate('/not-found');
      }
    };
    
    fetchProduct();
  }, [id, navigate]);
  
  // Handle color selection
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    // Update images based on the selected color
    if (colorImages[color] && colorImages[color].length > 0) {
      setActiveImage(colorImages[color][0]);
    } else if (product?.mainImage) {
      setActiveImage(product.mainImage);
    }
    
    // Reset selected size when color changes
    setSelectedSize(null);
  };
  
  // Set the active image
  const handleImageClick = (imageUrl: string) => {
    setActiveImage(imageUrl);
  };

  const getSizesForCurrentColor = () => {
    if (!product || !product.sizes) return [];
    
    if (selectedColor && product.colorSizes && product.colorSizes[selectedColor]) {
      // Return sizes specific to the selected color
      return product.colorSizes[selectedColor];
    }
    
    // Return all sizes if no color specific sizes
    return product.sizes;
  };
  
  const isOutOfStock = !getSizesForCurrentColor().some(size => size && size.stock > 0);
  const sizesForCurrentColor = getSizesForCurrentColor();

  const getCurrentImages = () => {
    if (selectedColor && colorImages[selectedColor]) {
      return colorImages[selectedColor];
    }
    return product?.images || [];
  };

  const getColorHex = (color: string) => {
    return colorMap[color] || color;
  };

  const getStockForSize = (size: string) => {
    if (product && product.sizes) {
      const sizeObj = product.sizes.find(s => s.size === size);
      return sizeObj ? sizeObj.stock : 0;
    }
    return 0;
  };

  const getSizePrice = (size: string) => {
    if (product && product.sizes) {
      const sizeObj = product.sizes.find(s => s.size === size);
      return sizeObj ? sizeObj.price : 0;
    }
    return 0;
  };

  const getColorBorder = (color: string) => {
    return colorMap[color] ? `1px solid ${colorMap[color]}` : '1px solid #ccc';
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('المنتج غير متوفر حالياً');
      return;
    }
    
    if (!selectedSize || (!selectedColor && product.colors && product.colors.length > 0)) {
      toast.error('يرجى اختيار المقاس واللون');
      return;
    }
    
    // Use CartDatabase to add the product with color and size
    import('@/models/CartDatabase').then(async ({ default: CartDatabase }) => {
      const cartDb = CartDatabase.getInstance();
      await cartDb.addToCart(product, selectedSize, selectedColor, quantity);
      toast.success('تم إضافة المنتج للعربة!');
      navigate('/cart');
    });
  };

  if (loading) {
    return <Layout><div className="text-center py-20">جاري تحميل المنتج...</div></Layout>;
  }

  if (!product) {
    return <Layout><div className="text-center py-20">المنتج غير موجود</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="mb-4 border rounded overflow-hidden">
              <AspectRatio ratio={1}>
                <img
                  src={activeImage}
                  alt={product?.name || "Product"}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </AspectRatio>
            </div>

            {/* Thumbnails */}
            <div className="flex overflow-x-auto gap-2 pb-2">
              {getCurrentImages().map((image, index) => (
                <div
                  key={index}
                  className={`border rounded cursor-pointer flex-shrink-0 w-16 h-16 overflow-hidden ${
                    activeImage === image ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {/* Title and Price */}
            <div>
              <h1 className="text-2xl font-bold">{product?.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {product?.hasDiscount && product?.discount && product?.discount > 0 ? (
                  <>
                    <span className="text-gray-500 line-through">
                      {product.originalPrice || (selectedSize && getSizePrice(selectedSize) * (1 + product.discount / 100))} جنيه
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {selectedSize ? getSizePrice(selectedSize) : product?.price} جنيه
                    </span>
                    <Badge className="bg-red-600">خصم {product.discount}%</Badge>
                  </>
                ) : (
                  <span className="text-xl font-bold text-green-600">
                    {selectedSize ? getSizePrice(selectedSize) : product?.price} جنيه
                  </span>
                )}
              </div>
            </div>

            {/* Colors */}
            {product?.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">اللون:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        selectedColor === color
                          ? "ring-2 ring-offset-2 ring-blue-500"
                          : ""
                      }`}
                      style={{
                        backgroundColor: getColorHex(color),
                        border: getColorBorder(color),
                      }}
                      onClick={() => handleColorChange(color)}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizesForCurrentColor.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">المقاس:</h3>
                <div className="flex flex-wrap gap-2">
                  {sizesForCurrentColor.map((size) => {
                    if (!size) return null;
                    const isAvailable = size.stock > 0;
                    return (
                      <button
                        key={size.size}
                        className={`px-3 py-1 border rounded-md ${
                          selectedSize === size.size
                            ? "bg-green-600 text-white border-green-600"
                            : isAvailable
                            ? "bg-white hover:bg-gray-100"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => isAvailable && setSelectedSize(size.size)}
                        disabled={!isAvailable}
                      >
                        {size.size}
                        {!isAvailable && <span className="block text-xs">نفذت الكمية</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            {!isOutOfStock && (
              <div>
                <h3 className="text-sm font-medium mb-2">الكمية:</h3>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedSize && getStockForSize(selectedSize) <= quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to cart button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isOutOfStock || !selectedSize}
              onClick={handleAddToCart}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري الإضافة...
                </span>
              ) : isOutOfStock ? (
                "نفذت الكمية"
              ) : !selectedSize ? (
                "برجاء اختيار المقاس"
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" /> إضافة إلى العربة
                </span>
              )}
            </Button>

            {/* Description */}
            <div>
              <h3 className="text-md font-medium mb-2">وصف المنتج:</h3>
              {product?.description ? (
                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
              ) : (
                <p className="text-gray-400 italic">لا يوجد وصف متاح لهذا المنتج.</p>
              )}
            </div>

            {/* Additional information */}
            <div>
              <h3 className="text-md font-medium mb-2">معلومات إضافية:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                {product?.categoryPath && (
                  <p>
                    <span className="font-semibold">التصنيف: </span>
                    {product.categoryPath.join(" > ")}
                  </p>
                )}
                <p>
                  <span className="font-semibold">الكود: </span>
                  {product?.sku || product?.id?.substring(0, 8) || "-"}
                </p>
                <p>
                  <span className="font-semibold">الحالة: </span>
                  {isOutOfStock ? "غير متوفر" : "متوفر"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
