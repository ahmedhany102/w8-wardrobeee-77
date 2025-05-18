import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/CartSlice';
import { toast } from 'react-toastify';

const Product = ({ id, title, description, price, image, sizes, colors }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ id, title, description, price, image, sizes, colors }));
    toast.success("تمت الإضافة للسلة");
  };

  return (
    <Card className="w-full max-w-sm shadow-lg rounded-2xl p-4 border border-gray-200">
      <img src={image} alt={title} className="w-full h-64 object-cover rounded-xl mb-4" />
      <CardContent>
        <h2 className="text-xl font-semibold mb-2 text-center">{title}</h2>
        <p className="text-gray-700 text-sm mb-2 text-center">{description}</p>
        <p className="text-lg font-bold text-center text-green-600 mb-4">{price} جنيه</p>

        {sizes && sizes.length > 0 && (
          <div className="mb-2">
            <h3 className="text-sm font-medium text-gray-700 mb-1">المقاسات:</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size, index) => (
                <span
                  key={index}
                  className="border px-2 py-1 rounded text-sm text-gray-600"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        {colors && colors.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">الألوان:</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color, index) => (
                <span
                  key={index}
                  className="w-5 h-5 rounded-full border"
                  style={{ backgroundColor: color }}
                ></span>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Button onClick={handleAddToCart} className="w-full bg-green-600 hover:bg-green-700 text-white">
            أضف للسلة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Product;
