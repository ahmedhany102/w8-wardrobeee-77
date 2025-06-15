import React, { useState, useEffect } from 'react';
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
import { useProductVariants } from "@/hooks/useProductVariants";
import { useCategories } from '@/hooks/useCategories';

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
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // --- NEW: Fetch color variants from normalized table ---
  const { variants, fetchVariants, loading: variantsLoading } = useProductVariants(id || "");
  // --- NEW: Category info ---
  const { categories } = useCategories();

  // Selected color variant and option (size)
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');

  // Set product info and main image (from legacy record, still needed for details and fallback)
  const [activeImage, setActiveImage] = useState<string>('');

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

        // Get basic product info (details), but not variants
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        LoadingFallback.clearTimeout('product-details');

        if (error || !data) {
          toast.error('Failed to load product');
          navigate('/not-found');
          return;
        }

        // Fix: make sure images/colors are arrays, not Json
        const patchedProduct = {
          ...data,
          images: Array.isArray(data.images) ? (data.images as string[]) : [],
          colors: Array.isArray(data.colors) ? (data.colors as string[]) : [],
        };
        setProduct(patchedProduct);

        // Set fallback/main image (only use string types)
        let mainImg = '';
        if (typeof patchedProduct.main_image === 'string' && patchedProduct.main_image) {
          mainImg = patchedProduct.main_image;
        } else if (patchedProduct.images && patchedProduct.images.length > 0 && typeof patchedProduct.images[0] === 'string') {
          mainImg = patchedProduct.images[0];
        } else {
          mainImg = '/placeholder.svg';
        }
        setActiveImage(mainImg);

      } catch (error: any) {
        LoadingFallback.clearTimeout('product-details');
        toast.error('Failed to load product');
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchVariants();
  }, [id, navigate, fetchVariants]);

  // Selection state logic for variants
  useEffect(() => {
    if (!variantsLoading && variants.length > 0) {
      // If none selected or invalid, pick first variant
      if (!selectedColorId || !variants.some(v => v.id === selectedColorId)) {
        setSelectedColorId(variants[0].id);
        setSelectedOptionId('');
        setActiveImage(variants[0].image || product?.main_image || '/placeholder.svg');
      }
    }
  }, [variants, selectedColorId, variantsLoading, product]);

  // When color changes, load first available size/option+set image
  useEffect(() => {
    const cur = variants.find(v => v.id === selectedColorId);
    if (cur && cur.options && cur.options.length > 0) {
      if (!selectedOptionId || !cur.options.some(o => o.id === selectedOptionId)) {
        setSelectedOptionId(cur.options[0].id);
      }
      setActiveImage(cur.image || product?.main_image || '/placeholder.svg');
    }
  }, [selectedColorId, variants, selectedOptionId, product]);

  // Find currently selected color variant and option (size)
  const selectedColorVariant = variants.find(v => v.id === selectedColorId);
  const selectedOption = selectedColorVariant?.options?.find(o => o.id === selectedOptionId);

  // Compute stock and price per selection, fallback to product base if not available
  const isOutOfStock = !selectedOption || selectedOption.stock <= 0;
  const currentPrice = selectedOption?.price ?? product?.price ?? 0;
  const hasDiscount = !!(product?.discount && product.discount > 0);
  const discountedPrice = hasDiscount ? currentPrice - (currentPrice * (product?.discount ?? 0) / 100) : currentPrice;
  const originalPrice = hasDiscount ? currentPrice : null;

  // --- Category label ---
  const productCategory = categories.find((cat) => cat.id === product?.category_id)?.name || product?.category;

  // --- Handle add to cart ---
  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error('المنتج غير متوفر حالياً');
      return;
    }
    if (!selectedColorVariant || !selectedOption) {
      toast.error('يرجى اختيار اللون والمقاس');
      return;
    }

    if (selectedOption.stock < quantity) {
      toast.error(`عذراً، المتاح فقط ${selectedOption.stock} قطعة من هذا المنتج`);
      return;
    }

    try {
      setAddingToCart(true);
      // Save IDs for accurate cart & later ordering.
      const cartProduct = {
        ...product,
        id: product!.id,
        name: product!.name,
        main_image: selectedColorVariant.image || product!.main_image,
        color_variant_id: selectedColorVariant.id,
        color: selectedColorVariant.color,
        option_id: selectedOption.id,
        size: selectedOption.size,
        price: selectedOption.price,
        stock: selectedOption.stock
      };
      // Pass full IDs, not just names
      const success = await addToCart(cartProduct, selectedOption.size, selectedColorVariant.color, quantity, selectedColorVariant.id, selectedOption.id);
      if (success) {
        // Optional UI nav
      }
    } catch (error) {
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- Product Image --- */}
          <div>
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
            {/* Variant thumbnails */}
            {variants.length > 0 && (
              <div className="flex overflow-x-auto gap-2 pb-2">
                {variants.map((v) => (
                  v.image ? (
                    <div
                      key={v.id}
                      className={`border rounded cursor-pointer flex-shrink-0 w-16 h-16 overflow-hidden ${
                        activeImage === v.image ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => {
                        setSelectedColorId(v.id);
                        setActiveImage(v.image);
                      }}
                    >
                      <img
                        src={v.image}
                        alt={`لون ${v.color}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>
          {/* --- Details column --- */}
          <div className="space-y-4">
            {/* Title + Price */}
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
            {/* Stock */}
            {selectedOption && (
              <div>
                {selectedOption.stock === 0 ? (
                  <Badge variant="destructive">نفذت الكمية</Badge>
                ) : selectedOption.stock === 1 ? (
                  <Badge variant="destructive">بقي قطعة واحدة فقط!</Badge>
                ) : selectedOption.stock <= 5 ? (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    بقي {selectedOption.stock} قطع فقط
                  </Badge>
                ) : null}
              </div>
            )}
            {/* --- Color selector --- */}
            <div>
              <h3 className="text-sm font-medium mb-2">اللون:</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      selectedColorId === v.id ? "ring-2 ring-offset-2 ring-blue-500" : ""
                    }`}
                    style={{
                      backgroundColor: colorMap[v.color] || v.color,
                      border: "1px solid #ccc",
                    }}
                    onClick={() => {
                      setSelectedColorId(v.id);
                      setActiveImage(v.image || product?.main_image || '/placeholder.svg');
                    }}
                    aria-label={`Select ${v.color} color`}
                  />
                ))}
              </div>
            </div>
            {/* --- Size (option) selector --- */}
            {selectedColorVariant?.options?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">المقاس:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedColorVariant.options.map((opt) => (
                    <button
                      key={opt.id}
                      className={`px-3 py-1 border rounded-md ${
                        selectedOptionId === opt.id
                          ? "bg-green-600 text-white border-green-600"
                          : opt.stock > 0
                          ? "bg-white hover:bg-gray-100"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={() => opt.stock > 0 && setSelectedOptionId(opt.id!)}
                      disabled={opt.stock <= 0}
                    >
                      {opt.size}
                      {opt.stock === 0 && <span className="block text-xs">نفذت الكمية</span>}
                      {opt.stock === 1 && (
                        <span className="block text-xs text-red-500">آخر قطعة!</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Quantity selector */}
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
                    disabled={selectedOption && selectedOption.stock <= quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            {/* Add to cart */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isOutOfStock || !selectedOption || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري الإضافة...
                </span>
              ) : isOutOfStock ? (
                "نفذت الكمية"
              ) : !selectedOption ? (
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
            {/* Additional info */}
            <div>
              <h3 className="text-md font-medium mb-2">معلومات إضافية:</h3>
              <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-md border">
                {productCategory && (
                  <p>
                    <span className="font-semibold">التصنيف: </span>
                    {productCategory}
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
