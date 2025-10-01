
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { formatProductForDisplay } from '@/utils/productUtils';
import { LoadingFallback } from '@/utils/loadingFallback';
import { useCartIntegration } from '@/hooks/useCartIntegration';
import { ProductVariantSelector } from '@/components/ProductVariantSelector';
import { ProductVariant } from '@/hooks/useProductVariants';

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

interface ProductSize {
  size: string;
  stock: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  category?: string;
  main_image?: string;
  images?: string[];
  colors?: string[];
  sizes?: ProductSize[];
  discount?: number;
  featured?: boolean;
  stock?: number;
  inventory?: number;
  [key: string]: any;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartIntegration();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantPrice, setVariantPrice] = useState<number>(0);
  const [variantStock, setVariantStock] = useState<number>(0);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate('/not-found');
        return;
      }

      try {
        setLoading(true);
        
        // Start loading timeout
        LoadingFallback.startTimeout('product-details', 5000, () => {
          setLoading(false);
          navigate('/not-found');
        });

        console.log('🔍 Fetching product details for ID:', id);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        LoadingFallback.clearTimeout('product-details');

        if (error) {
          console.error('❌ Error fetching product:', error);
          toast.error('Failed to load product');
          navigate('/not-found');
          return;
        }

        if (!data) {
          console.log('❌ Product not found');
          navigate('/not-found');
          return;
        }

        // Format and validate product data
        const formattedProduct = formatProductForDisplay(data);
        if (!formattedProduct) {
          navigate('/not-found');
          return;
        }

        console.log('✅ Product loaded:', formattedProduct);
        setProduct(formattedProduct);
        
        // Set main image
        const mainImg = formattedProduct.main_image || 
                       formattedProduct.image_url ||
                       (formattedProduct.images && formattedProduct.images[0]) || 
                       '/placeholder.svg';
        setActiveImage(mainImg);
        
        // Initialize variant price with base product price
        setVariantPrice(formattedProduct.price || 0);
        
      } catch (error: any) {
        LoadingFallback.clearTimeout('product-details');
        console.error('💥 Exception while fetching product:', error);
        toast.error('Failed to load product');
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate]);

  // Handle variant selection - memoized to prevent infinite loops
  const handleVariantChange = useCallback((variant: ProductVariant | null, price: number, stock: number) => {
    setSelectedVariant(variant);
    setVariantPrice(price);
    setVariantStock(stock);
    
    if (variant) {
      // Update the active image to the variant's image
      setActiveImage(variant.image_url);
      setSelectedColor(variant.label);
    }
  }, []);
  
  // Set the active image
  const handleImageClick = (imageUrl: string) => {
    setActiveImage(imageUrl);
  };

  const getAvailableSizes = () => {
    if (!product || !product.sizes) return [];
    return product.sizes.filter(size => size && size.size);
  };
  
  const isOutOfStock = selectedVariant ? variantStock <= 0 : !getAvailableSizes().some(size => size && size.stock > 0);

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
      return sizeObj ? sizeObj.price : product?.price || 0;
    }
    return product?.price || 0;
  };

  const getColorBorder = (color: string) => {
    return colorMap[color] ? `1px solid ${colorMap[color]}` : '1px solid #ccc';
  };

  const displayStockMessage = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">نفذت الكمية</Badge>;
    } else if (stock === 1) {
      return <Badge variant="destructive">بقي قطعة واحدة فقط!</Badge>;
    } else if (stock <= 5) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">بقي {stock} قطع فقط</Badge>;
    }
    return null;
  };

  const calculateDiscountedPrice = (originalPrice: number, discount: number) => {
    if (!discount) return originalPrice;
    return originalPrice - (originalPrice * (discount / 100));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error('المنتج غير متوفر حالياً');
      return;
    }
    
    // For products with variants, check variant selection
    if (selectedVariant) {
      if (variantStock < quantity) {
        toast.error(`عذراً، المتاح فقط ${variantStock} قطعة من هذا اللون`);
        return;
      }
    } else {
      // For products without variants, use legacy system
      if (!selectedSize || (!selectedColor && product?.colors && product.colors.length > 0)) {
        toast.error('يرجى اختيار المقاس واللون');
        return;
      }
      
      // Check stock quantity
      const currentStock = getStockForSize(selectedSize);
      if (currentStock < quantity) {
        toast.error(`عذراً، المتاح فقط ${currentStock} قطعة من هذا المنتج`);
        return;
      }
    }
    
    try {
      setAddingToCart(true);
      
      // Convert product to the format expected by CartDatabase
      const productForCart = {
        id: product!.id,
        name: product!.name,
        price: currentPrice,
        mainImage: selectedVariant ? selectedVariant.image_url : product!.main_image,
        images: product!.images,
        colors: product!.colors,
        sizes: product!.sizes,
        description: product!.description,
        category: product!.category || product!.type,
        inventory: selectedVariant ? variantStock : (product!.inventory || product!.stock || 0),
        featured: product!.featured,
        discount: product!.discount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const cartSize = selectedSize || 'متاح';
      const cartColor = selectedVariant ? selectedVariant.label : (selectedColor || '');
      const success = await addToCart(productForCart, cartSize, cartColor, quantity);
      
      if (success) {
        // Optional: Navigate to cart or stay on page
        // navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ أثناء إضافة المنتج للعربة');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4 border rounded overflow-hidden">
                <AspectRatio ratio={1}>
                  <div className="w-full h-full bg-muted animate-pulse" />
                </AspectRatio>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border rounded flex-shrink-0 w-16 h-16 bg-muted animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-2/3 bg-muted animate-pulse rounded" />
              <div className="h-6 w-1/3 bg-muted animate-pulse rounded" />
              <div className="h-24 bg-muted animate-pulse rounded" />
              <div className="h-16 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
        </div>
      </Layout>
    );
  }

  // Calculate correct prices - use variant price if available
  const currentPrice = selectedVariant ? variantPrice : (selectedSize ? getSizePrice(selectedSize) : product.price);
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount ? calculateDiscountedPrice(currentPrice, product.discount!) : currentPrice;
  const originalPrice = hasDiscount ? currentPrice : null;

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
                  width={800}
                  height={800}
                  decoding="async"
                  loading="eager"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </AspectRatio>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex overflow-x-auto gap-2 pb-2">
                {product.images.map((image, index) => (
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
                      width={64}
                      height={64}
                      decoding="async"
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {/* Title and Price */}
            <div>
              <h1 className="text-2xl font-bold">{product?.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {hasDiscount ? (
                  <>
                    <span className="text-gray-500 line-through">
                      {originalPrice} جنيه
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {discountedPrice} جنيه
                    </span>
                    <Badge className="bg-red-600">خصم {product.discount}%</Badge>
                  </>
                ) : (
                  <span className="text-xl font-bold text-green-600">
                    {currentPrice} جنيه
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            {selectedVariant && (
              <div>
                {displayStockMessage(variantStock)}
              </div>
            )}

            {/* Product Variants (Colors with Images) */}
            <ProductVariantSelector 
              product={product}
              onVariantChange={handleVariantChange}
            />

            {/* Sizes */}
            {getAvailableSizes().length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">المقاس:</h3>
                <div className="flex flex-wrap gap-2">
                  {getAvailableSizes().map((size) => {
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
                        {isAvailable && size.stock === 1 && (
                          <span className="block text-xs text-red-500">آخر قطعة!</span>
                        )}
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
                    disabled={selectedVariant ? variantStock <= quantity : (selectedSize && getStockForSize(selectedSize) <= quantity)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to cart button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isOutOfStock || (!selectedVariant && !selectedSize) || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري الإضافة...
                </span>
              ) : isOutOfStock ? (
                "نفذت الكمية"
              ) : (!selectedVariant && !selectedSize) ? (
                "برجاء اختيار اللون والمقاس"
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
                <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-md border">{product.description}</p>
              ) : (
                <p className="text-gray-400 italic">لا يوجد وصف متاح لهذا المنتج.</p>
              )}
            </div>

            {/* Additional information */}
            <div>
              <h3 className="text-md font-medium mb-2">معلومات إضافية:</h3>
              <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-md border">
                {product?.category && (
                  <p>
                    <span className="font-semibold">التصنيف: </span>
                    {product.category}
                  </p>
                )}
                <p>
                  <span className="font-semibold">الكود: </span>
                  {product?.id?.substring(0, 8) || "-"}
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
