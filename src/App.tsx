import React, { useState } from "react";

function ProductCard({ product }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="product-card">
      {/* باقي تفاصيل المنتج */}
      <button onClick={() => setShowDetails(true)}>عرض التفاصيل</button>
      {showDetails && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDetails(false)}>إغلاق</button>
            <h2>{product.name}</h2>
            <img src={product.mainImage} alt={product.name} />
            <div>
              <h4>الألوان المتوفرة:</h4>
              {product.colors && product.colors.map(color => (
                <span key={color} style={{
                  background: color,
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'inline-block',
                  margin: 4
                }} />
              ))}
            </div>
            <div>
              <h4>المقاسات المتوفرة:</h4>
              <table>
                <thead>
                  <tr>
                    <th>المقاس</th>
                    <th>السعر</th>
                    <th>المخزون</th>
                    <th>صورة</th>
                  </tr>
                </thead>
                <tbody>
                  {product.sizes && product.sizes.map(size => (
                    <tr key={size.size}>
                      <td>{size.size}</td>
                      <td>{size.price} EGP</td>
                      <td>{size.stock}</td>
                      <td>{size.image ? <img src={size.image} width={40} /> : "بدون صورة"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4>تفاصيل إضافية:</h4>
              <p>{product.details}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
