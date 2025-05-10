
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

// Mock product data
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Premium Headphones",
    description: "High-quality wireless headphones with noise cancellation.",
    price: 199.99,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "Electronics"
  },
  {
    id: 2,
    name: "Smart Watch",
    description: "Track your fitness and stay connected with this smart watch.",
    price: 149.99,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "Electronics"
  },
  {
    id: 3,
    name: "Designer T-Shirt",
    description: "Comfortable cotton t-shirt with modern design.",
    price: 29.99,
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "Clothing"
  },
  {
    id: 4,
    name: "Running Shoes",
    description: "Lightweight and comfortable running shoes for all terrains.",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "Footwear"
  },
  {
    id: 5,
    name: "Smartphone",
    description: "Latest model smartphone with advanced camera system.",
    price: 899.99,
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "Electronics"
  },
  {
    id: 6,
    name: "Coffee Maker",
    description: "Automatic coffee maker with built-in grinder.",
    price: 119.99,
    imageUrl: "https://images.unsplash.com/photo-1525430182374-bf7e61082fa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "Home"
  }
];

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Extract unique categories
  useEffect(() => {
    const uniqueCategories = ["All", ...Array.from(new Set(MOCK_PRODUCTS.map(product => product.category)))];
    setCategories(uniqueCategories);
  }, []);

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = MOCK_PRODUCTS;
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    setProducts(filtered);
  }, [searchTerm, selectedCategory]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    // Get existing cart from localStorage
    const existingCartJSON = localStorage.getItem('cart');
    let cart: {product: Product, quantity: number}[] = [];

    if (existingCartJSON) {
      cart = JSON.parse(existingCartJSON);
      
      // Check if product already exists in cart
      const existingProductIndex = cart.findIndex(item => item.product.id === product.id);
      
      if (existingProductIndex >= 0) {
        // Update quantity
        cart[existingProductIndex].quantity += 1;
      } else {
        // Add new product
        cart.push({product, quantity: 1});
      }
    } else {
      // Create new cart
      cart = [{product, quantity: 1}];
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`);
    
    if (isModalOpen) {
      setIsModalOpen(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {user ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h1 className="text-3xl font-bold mb-4 md:mb-0">Products</h1>
              <div className="flex items-center w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <Button 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map(product => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl cursor-pointer" onClick={() => handleProductClick(product)}>
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-navy-700 font-semibold">
                        ${product.price.toFixed(2)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="line-clamp-2 text-sm text-gray-500">{product.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => handleProductClick(product)}
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-xl text-gray-500">No products found matching your criteria.</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to w8 Market</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Find the best products at the best prices. Sign up or login to start shopping.
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate("/login")} 
                variant="outline" 
                size="lg"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/signup")} 
                className="bg-navy-600 hover:bg-navy-700" 
                size="lg"
              >
                Sign Up
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>Best Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Browse through thousands of high-quality products from trusted brands.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Fast Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Get your orders delivered quickly with our reliable shipping partners.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Safe Shopping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Shop with confidence knowing your personal information is secure.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {selectedProduct && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                {selectedProduct.category}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="h-48 overflow-hidden rounded-md">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm">{selectedProduct.description}</p>
              <p className="text-lg font-bold">${selectedProduct.price.toFixed(2)}</p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => handleAddToCart(selectedProduct)}
                className="w-full"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </Layout>
  );
};

export default Index;
