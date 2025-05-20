
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '@/models/Product';
import ProductDatabase from '@/models/Product';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

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

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const [availableSizes, setAvailableSizes] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      const db = ProductDatabase.getInstance();
      const prod = await db.getProductById(id);
      if (prod) {
        setProduct(prod);
        
        // Set first available color if there are color variations
        if (prod.colors && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0]);
          
          // Find image for selected color
          const colorImage = prod.colorImages?.find(ci => ci.color === prod.colors?.[0]);
          if (colorImage) {
            setCurrentImage(colorImage.imageUrl);
          } else {
            setCurrentImage(prod.mainImage || (prod.images?.[0] || ''));
          }
          
          // Get available sizes for this color (in this version, all sizes are available for all colors)
          const prodSizes = prod.sizes?.filter(s => s.stock > 0) || [];
          setAvailableSizes(prodSizes);
        } else {
          // No color variations, just use main image
          setCurrentImage(prod.mainImage || (prod.images?.[0] || ''));
          
          // Get all available sizes
          const prodSizes = prod.sizes?.filter(s => s.stock > 0) || [];
          setAvailableSizes(prodSizes);
        }
      }
    };
    
    fetchProduct();
  }, [id]);

  // Update available sizes when color changes
  useEffect(() => {
    if (product && selectedColor) {
      // Find image for the selected color
      const colorImage = product.colorImages?.find(ci => ci.color === selectedColor);
      if (colorImage) {
        setCurrentImage(colorImage.imageUrl);
        // Reset image index since we're viewing a color-specific image now
        setImgIdx(0);
      } else {
        setCurrentImage(product.mainImage || (product.images?.[0] || ''));
      }

      // For now, we'll show all sizes since we don't have color-specific sizes yet
      // In a real implementation, you would filter sizes based on color
      const prodSizes = product.sizes?.filter(s => s.stock > 0) || [];
      setAvailableSizes(prodSizes);
      
      // Reset selected size when color changes
      setSelectedSize('');
    }
  }, [selectedColor, product]);

  if (!product) return <Layout><div className="text-center py-20">جاري تحميل المنتج...</div></Layout>;

  const isOutOfStock = availableSizes.length === 0;
  
  // Collect images for display - start with the current color image or main image
  let images = [currentImage];
  // Add other images if available (but avoid duplicates)
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (!images.includes(img)) {
        images.push(img);
      }
    });
  }
  
  // Handle add to cart
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
      await cartDb.addToCart(product, selectedSize, selectedColor, 1);
      toast.success('تم إضافة المنتج للعربة!');
      navigate('/cart');
    });
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Image Slider */}
          <div className="flex flex-col items-center md:w-1/2">
            <div className="relative w-full flex justify-center">
              <img 
                src={images[imgIdx]} 
                alt={product.name} 
                className="rounded-lg object-contain w-full h-80 bg-white border" 
              />
              {images.length > 1 && (
                <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center px-2">
                  <button 
                    onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} 
                    className="bg-gray-200 rounded-full p-1"
                  >◀</button>
                  <button 
                    onClick={() => setImgIdx((imgIdx + 1) % images.length)} 
                    className="bg-gray-200 rounded-full p-1"
                  >▶</button>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="thumb" 
                    className={`h-12 w-12 object-cover rounded border cursor-pointer ${imgIdx === idx ? 'ring-2 ring-green-600' : ''}`} 
                    onClick={() => setImgIdx(idx)} 
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <div className="text-gray-600">
              {product.categoryPath ? product.categoryPath.join(" > ") : product.category} - {product.type}
            </div>
            <div className="text-gray-700">{product.details || product.description}</div>
            
            {/* Stock status indicator */}
            <div className={`text-sm font-bold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
              {isOutOfStock ? 'غير متوفر حالياً' : 'متوفر'}
            </div>
            
            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block font-bold mb-1">اختر اللون:</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => {
                    // Find color image
                    const colorImg = product.colorImages?.find(ci => ci.color === color)?.imageUrl;
                    
                    return (
                      <button
                        key={color}
                        type="button"
                        className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden focus:outline-none ${selectedColor === color ? 'ring-2 ring-green-600 border-green-600' : 'border-gray-300'}`}
                        title={color}
                        onClick={() => setSelectedColor(color)}
                      >
                        {colorImg ? (
                          <img src={colorImg} alt={color} className="object-cover w-full h-full" />
                        ) : (
                          <div 
                            className="w-full h-full" 
                            style={{ background: colorMap[color] || color }}
                          ></div>
                        )}
                        {selectedColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                            <span className="text-xs text-white font-bold">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedColor}</p>
              </div>
            )}
            
            {/* Size selection */}
            {availableSizes.length > 0 && (
              <div>
                <label className="block font-bold mb-1">اختر المقاس:</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size.size}
                      type="button"
                      className={`px-3 py-1 border rounded-full ${selectedSize === size.size ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                      onClick={() => setSelectedSize(size.size)}
                    >
                      {size.size} - {size.price} EGP
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add to cart button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 mt-4"
              disabled={isOutOfStock || !selectedSize || (product.colors && product.colors.length > 0 && !selectedColor)}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'غير متوفر' : 'أضف للعربة'}
            </Button>
            
            {/* Discount information */}
            {product.hasDiscount && product.discount && product.discount > 0 && (
              <div className="bg-red-50 border border-red-100 rounded p-2 text-center">
                <span className="text-red-600 font-bold">خصم {product.discount}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
