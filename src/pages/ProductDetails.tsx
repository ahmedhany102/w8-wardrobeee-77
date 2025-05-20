import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '@/models/Product';
import ProductDatabase from '@/models/Product';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Loader from '@/components/ui/loader';

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

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const db = ProductDatabase.getInstance();
        const prod = await db.getProductById(id);
        setProduct(prod);
        if (prod?.variants?.length > 0) {
          setSelectedSize(prod.variants[0].size || '');
          setSelectedColor(prod.variants[0].color || '');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('حدث خطأ أثناء تحميل المنتج');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <Layout><Loader size="lg" className="py-20" /></Layout>;
  if (!product) return <Layout><div className="text-center py-20">المنتج غير موجود</div></Layout>;

  const availableVariants = product.variants.filter(v => v.stock > 0);
  const isOutOfStock = availableVariants.length === 0;
  const images = product.images && product.images.length > 0 ? product.images : [product.variants[0]?.imageUrl || '/placeholder.svg'];

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('المنتج غير متوفر حالياً');
      return;
    }
    
    if (!selectedSize || !selectedColor) {
      toast.error('يرجى اختيار المقاس واللون');
      return;
    }

    import('@/models/CartDatabase').then(async ({ default: CartDatabase }) => {
      const cartDb = CartDatabase.getInstance();
      await cartDb.addToCart(product, selectedSize, selectedColor, 1);
      toast.success('تم إضافة المنتج للعربة!');
      navigate('/cart');
    });
  };

  const selectedVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* سلايدر صور */}
          <div className="flex flex-col items-center md:w-1/2">
            <div className="relative w-full flex justify-center">
              <AspectRatio ratio={4/3}>
                <img src={images[imgIdx]} alt={product.name} className="rounded-lg object-contain w-full h-full bg-white border" />
              </AspectRatio>
              {images.length > 1 && (
                <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center px-2">
                  <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} className="bg-gray-200 rounded-full p-1">◀</button>
                  <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} className="bg-gray-200 rounded-full p-1">▶</button>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              {images.map((img, idx) => (
                <img key={idx} src={img} alt="thumb" className={`h-12 w-12 object-cover rounded border cursor-pointer ${imgIdx === idx ? 'ring-2 ring-green-600' : ''}`} onClick={() => setImgIdx(idx)} />
              ))}
            </div>
          </div>
          {/* تفاصيل المنتج */}
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="text-gray-600">{product.category} - {product.type}</div>
            <div className="text-gray-700">{product.details}</div>
            
            {/* Stock status indicator */}
            <div className={`text-sm font-bold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
              {isOutOfStock ? 'غير متوفر حالياً' : 'متوفر'}
            </div>
            
            {/* اختيار اللون */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block font-bold mb-1">اختر اللون:</label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(product.variants.map(v => v.color))).map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center focus:outline-none ${selectedColor === color ? 'ring-2 ring-green-600 border-green-600' : 'border-gray-300'}`}
                      style={{ background: colorMap[color || ''] || color, color: color === 'أبيض' ? '#111' : '#fff' }}
                      title={color}
                      onClick={() => setSelectedColor(color || '')}
                    >
                      {selectedColor === color && <span className="text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* اختيار المقاس */}
            {availableVariants.length > 0 && (
              <div>
                <label className="block font-bold mb-1">اختر المقاس:</label>
                <select
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                >
                  {Array.from(new Set(availableVariants.map(v => v.size))).map(size => (
                    <option key={size} value={size}>
                      {size} - {selectedVariant?.price || 0} EGP
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 mt-4"
              disabled={isOutOfStock || !selectedSize || !selectedColor}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'غير متوفر' : 'أضف للعربة'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
