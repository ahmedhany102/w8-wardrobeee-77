
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ProductManagement from "@/components/admin/ProductManagement";
import OrdersPanel from "@/components/admin/OrdersPanel";
import CouponManagement from "@/components/admin/CouponManagement";
import AdminContactSettings from "@/components/admin/AdminContactSettings";
import AdManagement from "@/components/admin/AdManagement";
import { Home, LogOut, Package, Settings, Ticket, Users } from "lucide-react";
import UsersPanel from "@/components/admin/UsersPanel";

const Admin = ({ activeTab = "dashboard" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Check if user exists and is admin
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/admin-login" />;
  }

  const handleLogout = () => {
    logout(); // Using logout instead of signOut
    navigate("/");
  };

  return (
    <Layout hideFooter>
      <div className="container mx-auto py-4 px-4 md:px-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome {user.displayName || user.name || user.email}, you can manage the store here.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 mt-4 md:mt-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs 
          value={currentTab} 
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <TabsList className="flex overflow-x-auto mb-6 pb-2 scrollbar-hide">
            <TabsTrigger value="dashboard" onClick={() => navigate("/admin")}>
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" onClick={() => navigate("/admin/products")}>
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="orders" onClick={() => navigate("/admin/orders")}>
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" onClick={() => navigate("/admin/coupons")}>
              <Ticket className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="contact" onClick={() => navigate("/admin/contact")}>
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="ads" onClick={() => navigate("/admin/ads")}>
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Advertisements</span>
            </TabsTrigger>
            <TabsTrigger value="users" onClick={() => navigate("/admin/users")}>
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dashboard content */}
              <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="text-xl font-bold">Store Management</h3>
                <p className="mt-2 text-gray-600">
                  Welcome to the admin dashboard. You can manage products, orders, and more from here.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersPanel />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManagement />
          </TabsContent>

          <TabsContent value="contact">
            <AdminContactSettings />
          </TabsContent>

          <TabsContent value="ads">
            <AdManagement />
          </TabsContent>
          
          <TabsContent value="users">
            <UsersPanel />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
