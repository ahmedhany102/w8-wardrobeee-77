
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { LoadingFallback } from '@/utils/loadingFallback';
import { useCartIntegration } from '@/hooks/useCartIntegration';
import { useProductVariants, ProductColorVariant, ProductColorVariantOption } from '@/hooks/useProductVariants';

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
  sizes?: any[];
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
  const [selectedColorVariant, setSelectedColorVariant] = useState<ProductColorVariant | null>(null);
  const [selectedOption, setSelectedOption] = useState<ProductColorVariantOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Use the variants hook
  const { variants, loading: variantsLoading, fetchVariants } = useProductVariants(id || '');
  
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

        console.log('✅ Product loaded:', data);
        
        // Handle the Supabase Json types properly
        const formattedProduct: Product = {
          ...data,
          images: Array.isArray(data.images) 
            ? data.images.filter((img): img is string => typeof img === 'string')
            : (typeof data.images === 'string' ? [data.images] : []),
          colors: Array.isArray(data.colors) 
            ? data.colors.filter((color): color is string => typeof color === 'string')
            : (typeof data.colors === 'string' ? [data.colors] : []),
          sizes: Array.isArray(data.sizes) ? data.sizes : (data.sizes ? [data.sizes] : [])
        };
        
        setProduct(formattedProduct);
        
        // Fetch variants after product is loaded
        await fetchVariants();
        
        // Set main image
        const mainImg = formattedProduct.main_image || 
                       (formattedProduct.images && formattedProduct.images[0]) || 
                       '/placeholder.svg';
        setActiveImage(mainImg);
        
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

  // Set default selections when variants are loaded
  useEffect(() => {
    if (variants.length > 0 && !selectedColorVariant) {
      const firstVariant = variants[0];
      setSelectedColorVariant(firstVariant);
      setSelectedColor(firstVariant.color);
      
      if (firstVariant.options && firstVariant.options.length > 0) {
        const firstOption = firstVariant.options.find(opt => opt.stock > 0) || firstVariant.options[0];
        setSelectedOption(firstOption);
        setSelectedSize(firstOption.size);
      }
      
      // Set color-specific image
      if (firstVariant.image) {
        setActiveImage(firstVariant.image);
      }
    }
  }, [variants, selectedColorVariant]);

  // Handle color selection
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null);
    setSelectedOption(null);
    
    // Find the variant for this color
    const variant = variants.find(v => v.color === color);
    if (variant) {
      setSelectedColorVariant(variant);
      
      // Set the image for this color
      if (variant.image) {
        setActiveImage(variant.image);
      }
      
      // Auto-select first available size for this color
      if (variant.options && variant.options.length > 0) {
        const firstAvailable = variant.options.find(opt => opt.stock > 0) || variant.options[0];
        setSelectedOption(firstAvailable);
        setSelectedSize(firstAvailable.size);
      }
    }
  };
  
  // Set the active image
  const handleImageClick = (imageUrl: string) => {
    setActiveImage(imageUrl);
  };

  const getAvailableSizes = () => {
    if (!selectedColorVariant || !selectedColorVariant.options) return [];
    return selectedColorVariant.options.filter(option => option && option.size);
  };
  
  // Calculate stock based on ONLY variants (not legacy JSONB fields)
  const getTotalStock = () => {
    if (variants.length === 0) return 0;
    return variants.reduce((total, variant) => {
      if (!variant.options) return total;
      return total + variant.options.reduce((variantTotal, option) => variantTotal + (option.stock || 0), 0);
    }, 0);
  };

  const isOutOfStock = getTotalStock() === 0;

  const getColorHex = (color: string) => {
    return colorMap[color] || color;
  };

  const getStockForSize = (size: string) => {
    if (selectedColorVariant && selectedColorVariant.options) {
      const option = selectedColorVariant.options.find(opt => opt.size === size);
      return option ? option.stock : 0;
    }
    return 0;
  };

  const getSizePrice = (size: string) => {
    if (selectedColorVariant && selectedColorVariant.options) {
      const option = selectedColorVariant.options.find(opt => opt.size === size);
      return option ? option.price : product?.price || 0;
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
    
    if (!selectedSize || (!selectedColor && variants.length > 0)) {
      toast.error('يرجى اختيار المقاس واللون');
      return;
    }
    
    // Check stock quantity
    const currentStock = getStockForSize(selectedSize);
    if (currentStock < quantity) {
      toast.error(`عذراً، المتاح فقط ${currentStock} قطعة من هذا المنتج`);
      return;
    }
    
    try {
      setAddingToCart(true);
      
      // Convert product to the format expected by CartDatabase
      const productForCart = {
        id: product!.id,
        name: product!.name,
        price: selectedOption ? selectedOption.price : (product!.price || 0),
        mainImage: selectedColorVariant?.image || product!.main_image,
        images: product!.images,
        colors: variants.map(v => v.color),
        sizes: selectedColorVariant?.options || [],
        description: product!.description,
        category: product!.category || product!.type,
        inventory: selectedOption ? selectedOption.stock : (product!.inventory || product!.stock || 0),
        featured: product!.featured,
        discount: product!.discount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const success = await addToCart(productForCart, selectedSize, selectedColor || '', quantity);
      
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

  if (loading || variantsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p>جاري تحميل المنتج...</p>
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

  // Calculate correct prices
  const currentPrice = selectedOption ? selectedOption.price : (selectedSize ? getSizePrice(selectedSize) : product.price);
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
            {selectedSize && (
              <div>
                {displayStockMessage(getStockForSize(selectedSize))}
              </div>
            )}

            {/* Colors */}
            {variants.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium mb-2">اللون:</h3>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant) => {
                    const hasStock = variant.options && variant.options.some(opt => opt.stock > 0);
                    return (
                      <div key={variant.id} className="flex flex-col items-center gap-1">
                        <button
                          className={`w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                            selectedColor === variant.color
                              ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                              : hasStock 
                              ? "hover:scale-105"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                          style={{
                            backgroundColor: getColorHex(variant.color),
                            border: getColorBorder(variant.color),
                          }}
                          onClick={() => hasStock && handleColorChange(variant.color)}
                          disabled={!hasStock}
                          aria-label={`Select ${variant.color} color${!hasStock ? ' (out of stock)' : ''}`}
                        />
                        <span className={`text-xs text-center ${hasStock ? 'text-gray-600' : 'text-gray-400'}`}>
                          {variant.color}
                          {!hasStock && <div className="text-xs text-red-500">نفذت</div>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : variantsLoading ? (
              <div className="text-sm text-gray-500">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
                <p className="mt-2">جاري تحميل الألوان...</p>
              </div>
            ) : !product ? (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                <p>فشل في تحميل بيانات المنتج</p>
              </div>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p>هذا المنتج لا يحتوي على متغيرات ألوان أو مقاسات</p>
                <p className="text-xs mt-1">سعر المنتج: {product.price} جنيه</p>
              </div>
            )}

            {/* Sizes */}
            {getAvailableSizes().length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">المقاس:</h3>
                <div className="flex flex-wrap gap-2">
                  {getAvailableSizes().map((option) => {
                    if (!option) return null;
                    const isAvailable = option.stock > 0;
                    return (
                      <button
                        key={option.size}
                        className={`px-3 py-1 border rounded-md ${
                          selectedSize === option.size
                            ? "bg-green-600 text-white border-green-600"
                            : isAvailable
                            ? "bg-white hover:bg-gray-100"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSize(option.size);
                            setSelectedOption(option);
                          }
                        }}
                        disabled={!isAvailable}
                      >
                        {option.size}
                        {!isAvailable && <span className="block text-xs">نفذت الكمية</span>}
                        {isAvailable && option.stock === 1 && (
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
              disabled={isOutOfStock || !selectedSize || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
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
