
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatProductForDisplay } from '@/utils/productUtils';
import { LoadingFallback } from '@/utils/loadingFallback';
import { useCartIntegration } from '@/hooks/useCartIntegration';
import { Product } from '@/models/Product';
import { useProductVariants } from '@/hooks/useProductVariants';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartIntegration();
  const { variants, fetchVariants, loading: variantsLoading } = useProductVariants(id!);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate('/not-found');
        return;
      }

      try {
        setLoading(true);
        
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

        const formattedProduct = formatProductForDisplay(data);
        if (!formattedProduct) {
          navigate('/not-found');
          return;
        }

        console.log('✅ Product loaded:', formattedProduct);
        setProduct(formattedProduct);
        
        // Fetch variants after product is loaded
        if (id) {
          fetchVariants();
        }
        
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

  // Auto-select first available variant and option
  useEffect(() => {
    if (variants.length > 0 && !selectedColorId) {
      const firstVariant = variants[0];
      setSelectedColorId(firstVariant.id);
      
      if (firstVariant.options && firstVariant.options.length > 0) {
        const availableOption = firstVariant.options.find(opt => opt.stock > 0) || firstVariant.options[0];
        setSelectedOptionId(availableOption.id!);
      }
    }
  }, [variants, selectedColorId]);

  // Update selected option when color changes
  useEffect(() => {
    if (selectedColorId) {
      const currentVariant = variants.find(v => v.id === selectedColorId);
      if (currentVariant && currentVariant.options && currentVariant.options.length > 0) {
        const availableOption = currentVariant.options.find(opt => opt.stock > 0) || currentVariant.options[0];
        setSelectedOptionId(availableOption.id!);
      }
    }
  }, [selectedColorId, variants]);

  const selectedVariant = variants.find(v => v.id === selectedColorId);
  const selectedOption = selectedVariant?.options?.find(opt => opt.id === selectedOptionId);
  
  const currentPrice = selectedOption?.price || product?.price || 0;
  const currentStock = selectedOption?.stock || 0;
  const isOutOfStock = currentStock === 0;
  
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
    
    if (variants.length > 0 && (!selectedColorId || !selectedOptionId)) {
      toast.error('يرجى اختيار اللون والمقاس');
      return;
    }
    
    if (currentStock < quantity) {
      toast.error(`عذراً، المتaح فقط ${currentStock} قطعة من هذا المنتج`);
      return;
    }
    
    try {
      setAddingToCart(true);
      
      const productForCart = {
        id: product!.id,
        name: product!.name,
        price: currentPrice,
        mainImage: selectedVariant?.image || product!.main_image,
        images: product!.images,
        description: product!.description,
        category: product!.category,
        inventory: currentStock,
        featured: product!.featured,
        discount: product!.discount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const selectedColor = selectedVariant?.color || '';
      const selectedSize = selectedOption?.size || '';
      
      const success = await addToCart(productForCart, selectedSize, selectedColor, quantity);
      
      if (success) {
        toast.success('تم إضافة المنتج للعربة بنجاح');
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

  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount ? calculateDiscountedPrice(currentPrice, product.discount!) : currentPrice;
  const originalPrice = hasDiscount ? currentPrice : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border mb-4">
              <img
                src={selectedVariant?.image || product.main_image || product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            
            {/* Additional Images */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded border overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-75"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
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
              <h1 className="text-2xl font-bold">{product.name}</h1>
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

            {/* Color Selection */}
            {variants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">اللون:</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={variant.id === selectedColorId ? "default" : "outline"}
                      onClick={() => setSelectedColorId(variant.id)}
                      className={`px-4 py-2 ${
                        variant.id === selectedColorId 
                        ? "bg-green-600 text-white" 
                        : "bg-white text-gray-700"
                      }`}
                    >
                      {variant.color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {selectedVariant?.options && selectedVariant.options.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">المقاس:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedVariant.options.map((option) => {
                    const isAvailable = option.stock > 0;
                    const isSelected = option.id === selectedOptionId;
                    
                    return (
                      <Button
                        key={option.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => isAvailable && setSelectedOptionId(option.id!)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 ${
                          isSelected 
                          ? "bg-green-600 text-white"
                          : isAvailable
                          ? "bg-white text-gray-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-medium">{option.size}</div>
                          <div className="text-xs">
                            {isAvailable ? `${option.stock} متوفر` : "نفذ"}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Status */}
            {currentStock > 0 && (
              <div>
                {displayStockMessage(currentStock)}
              </div>
            )}

            {/* Quantity */}
            {!isOutOfStock && currentStock > 0 && (
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
                    disabled={currentStock <= quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to cart button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isOutOfStock || (variants.length > 0 && (!selectedColorId || !selectedOptionId)) || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري الإضافة...
                </span>
              ) : isOutOfStock ? (
                "نفذت الكمية"
              ) : variants.length > 0 && (!selectedColorId || !selectedOptionId) ? (
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
              {product.description ? (
                <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-md border">{product.description}</p>
              ) : (
                <p className="text-gray-400 italic">لا يوجد وصف متاح لهذا المنتج.</p>
              )}
            </div>

            {/* Additional information */}
            <div>
              <h3 className="text-md font-medium mb-2">معلومات إضافية:</h3>
              <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-md border">
                {product.category && (
                  <p>
                    <span className="font-semibold">التصنيف: </span>
                    {product.category}
                  </p>
                )}
                <p>
                  <span className="font-semibold">الكود: </span>
                  {product.id?.substring(0, 8) || "-"}
                </p>
                <p>
                  <span className="font-semibold">الحالة: </span>
                  {isOutOfStock ? "غير متوفر" : "متوفر"}
                </p>
                {selectedVariant && selectedOption && (
                  <>
                    <p>
                      <span className="font-semibold">اللون المختار: </span>
                      {selectedVariant.color}
                    </p>
                    <p>
                      <span className="font-semibold">المقاس المختار: </span>
                      {selectedOption.size}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
