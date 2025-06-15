
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useCartIntegration } from '@/hooks/useCartIntegration';
import { useProductVariants } from "@/hooks/useProductVariants";
import { useCategories } from '@/hooks/useCategories';

// Map for common color names to hex values
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

// Fallback interface for categories
interface Category {
  id: string;
  name: string;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartIntegration();
  const { variants, fetchVariants, loading: variantsLoading } = useProductVariants(id || "");
  const { categories } = useCategories();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [addingToCart, setAddingToCart] = useState(false);

  // 1. Load the base product for details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        toast.error('Failed to load product');
        navigate('/not-found');
        return;
      }

      // Parse images as array if not already
      let images: string[] = [];
      if (Array.isArray(data.images)) {
        images = data.images as string[];
      } else if (typeof data.images === 'string') {
        try {
          images = JSON.parse(data.images);
        } catch {
          images = [];
        }
      }

      setProduct({ ...data, images });
      setActiveImage(data.main_image || images?.[0] || '/placeholder.svg');
      setLoading(false);
    };

    fetchProduct();
    fetchVariants();
    // eslint-disable-next-line
  }, [id]);

  // 2. Set default selected color and size/option when variants are loaded
  useEffect(() => {
    if (!variantsLoading && variants.length > 0) {
      if (!selectedColorId || !variants.some(v => v.id === selectedColorId)) {
        setSelectedColorId(variants[0].id);
        setSelectedOptionId('');
        setActiveImage(variants[0].image || product?.main_image || '/placeholder.svg');
      }
    }
    // eslint-disable-next-line
  }, [variants, variantsLoading, product]);

  // 3. When color changes, pick the first available option
  useEffect(() => {
    const cur = variants.find(v => v.id === selectedColorId);
    if (cur && cur.options && cur.options.length > 0) {
      if (!selectedOptionId || !cur.options.some(o => o.id === selectedOptionId)) {
        setSelectedOptionId(cur.options[0].id);
      }
      setActiveImage(cur.image || product?.main_image || '/placeholder.svg');
    }
    // eslint-disable-next-line
  }, [selectedColorId, variants, selectedOptionId, product]);

  // Helpers
  const selectedColorVariant = variants.find(v => v.id === selectedColorId);
  const selectedOption = selectedColorVariant?.options?.find(o => o.id === selectedOptionId);

  const isOutOfStock = !selectedOption || selectedOption.stock <= 0;
  const currentPrice = selectedOption?.price ?? product?.price ?? 0;
  const hasDiscount = !!(product?.discount && product.discount > 0);
  const discountedPrice = hasDiscount ? currentPrice - (currentPrice * (product?.discount ?? 0) / 100) : currentPrice;
  const originalPrice = hasDiscount ? currentPrice : null;

  // -- Category label display --
  const productCategory = categories.find((cat: Category) => cat.id === product?.category_id)?.name || product?.category;

  // --- Add to cart (normalized variant) ---
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
      // Pass variant/option ids, price, etc to cart:
      const cartProduct = {
        id: product!.id,
        name: product!.name,
        price: selectedOption.price,
        mainImage: selectedColorVariant.image || product!.main_image,
        images: product!.images,
        color: selectedColorVariant.color,
        colorVariantId: selectedColorVariant.id,
        size: selectedOption.size,
        optionId: selectedOption.id,
        category: productCategory,
        description: product!.description,
        discount: product!.discount,
        inventory: product!.inventory,
      };
      const success = await addToCart(
        cartProduct,
        selectedOption.size, // real size
        selectedColorVariant.color, // real color string
        quantity
      );
      if (success) {
        // Optionally show a toast or move to the cart page.
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
                      className={`border rounded cursor-pointer flex-shrink-0 w-16 h-16 overflow-hidden ${activeImage === v.image ? "ring-2 ring-blue-500" : ""}`}
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
                    <span className="text-gray-500 line-through">{originalPrice} جنيه</span>
                    <span className="text-xl font-bold text-green-600">{discountedPrice} جنيه</span>
                    <Badge className="bg-red-600">خصم {product.discount}%</Badge>
                  </>
                ) : (
                  <span className="text-xl font-bold text-green-600">{currentPrice} جنيه</span>
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
                    className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedColorId === v.id ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
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
                      {opt.stock === 1 && <span className="block text-xs text-red-500">آخر قطعة!</span>}
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
