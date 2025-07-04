
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
import ProductVariantSelector from '@/components/ProductVariantSelector';
import { Product } from '@/models/Product';

interface ProductSize {
  size: string;
  stock: number;
  price: number;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartIntegration();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedStock, setSelectedStock] = useState<number>(0);
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

  // Handle variant selection from ProductVariantSelector
  const handleVariantChange = (color: string, size: string, price: number, stock: number) => {
    setSelectedColor(color);
    setSelectedSize(size);
    setSelectedPrice(price);
    setSelectedStock(stock);
  };

  const isOutOfStock = selectedStock === 0;
  
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
    
    if (!selectedSize || !selectedColor) {
      toast.error('يرجى اختيار المقاس واللون');
      return;
    }
    
    // Check stock quantity
    if (selectedStock < quantity) {
      toast.error(`عذراً، المتاح فقط ${selectedStock} قطعة من هذا المنتج`);
      return;
    }
    
    try {
      setAddingToCart(true);
      
      // Convert product to the format expected by CartDatabase
      const productForCart = {
        id: product!.id,
        name: product!.name,
        price: selectedPrice,
        mainImage: product!.main_image,
        images: product!.images,
        description: product!.description,
        category: product!.category,
        inventory: selectedStock,
        featured: product!.featured,
        discount: product!.discount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const success = await addToCart(productForCart, selectedSize, selectedColor, quantity);
      
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
  const currentPrice = selectedPrice || product.price || 0;
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount ? calculateDiscountedPrice(currentPrice, product.discount!) : currentPrice;
  const originalPrice = hasDiscount ? currentPrice : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Variant Selector */}
          <div>
            <ProductVariantSelector 
              product={product} 
              onVariantChange={handleVariantChange}
            />
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
            {selectedStock > 0 && (
              <div>
                {displayStockMessage(selectedStock)}
              </div>
            )}

            {/* Quantity */}
            {!isOutOfStock && selectedStock > 0 && (
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
                    disabled={selectedStock <= quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to cart button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isOutOfStock || !selectedSize || !selectedColor || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري الإضافة...
                </span>
              ) : isOutOfStock ? (
                "نفذت الكمية"
              ) : !selectedSize || !selectedColor ? (
                "برجاء اختيار المقاس واللون"
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
                {selectedColor && selectedSize && (
                  <>
                    <p>
                      <span className="font-semibold">اللون المختار: </span>
                      {selectedColor}
                    </p>
                    <p>
                      <span className="font-semibold">المقاس المختار: </span>
                      {selectedSize}
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
