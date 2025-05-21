
import React, { useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ProductManagement from "@/components/admin/ProductManagement";
import OrdersPanel from "@/components/admin/OrdersPanel";
import UsersPanel from "@/components/admin/UsersPanel";
import CouponManagement from "@/components/admin/CouponManagement";
import FeaturedProductsManagement from "@/components/admin/FeaturedProductsManagement";
import AdminContactSettings from "@/components/admin/AdminContactSettings";
import ContactMessages from "@/components/admin/ContactMessages";
import AdManagement from "@/components/admin/AdManagement";
import { Home, LogOut, Package, Settings, Ticket, Users, Mail, Mail1, MessageSquare, Image } from "lucide-react";

interface AdminProps {
  activeTab?: string;
}

const Admin: React.FC<AdminProps> = ({ activeTab = "dashboard" }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Check if user exists and is admin
  if (!user || !user.isAdmin) {
    return <Navigate to="/admin-login" />;
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Layout hideFooter>
      <div className="container mx-auto py-4 px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">لوحة التحكم</h1>
            <p className="text-gray-600">
              مرحباً {user.displayName || user.email}، يمكنك إدارة المتجر من هنا.
            </p>
          </div>
          <Button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 mt-4 md:mt-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            تسجيل الخروج
          </Button>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="flex overflow-x-auto mb-6 pb-2 scrollbar-hide">
            <TabsTrigger value="dashboard" onClick={() => navigate("/admin")}>
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">الرئيسية</span>
            </TabsTrigger>
            <TabsTrigger value="products" onClick={() => navigate("/admin/products")}>
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="orders" onClick={() => navigate("/admin/orders")}>
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">الطلبات</span>
            </TabsTrigger>
            <TabsTrigger value="users" onClick={() => navigate("/admin/users")}>
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">المستخدمين</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" onClick={() => navigate("/admin/coupons")}>
              <Ticket className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">كوبونات الخصم</span>
            </TabsTrigger>
            <TabsTrigger value="contact" onClick={() => navigate("/admin/contact")}>
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">رسائل التواصل</span>
            </TabsTrigger>
            <TabsTrigger value="ads" onClick={() => navigate("/admin/ads")}>
              <Image className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">الإعلانات</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md text-white cursor-pointer"
                onClick={() => setCurrentTab("orders")}
              >
                <h3 className="text-xl font-bold mb-2">الطلبات</h3>
                <p>إدارة طلبات العملاء ومتابعة حالة الطلبات</p>
              </div>
              <div 
                className="p-6 bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow-md text-white cursor-pointer"
                onClick={() => setCurrentTab("products")}
              >
                <h3 className="text-xl font-bold mb-2">المنتجات</h3>
                <p>إضافة وتعديل المنتجات وإدارة المخزون</p>
              </div>
              <div 
                className="p-6 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-md text-white cursor-pointer"
                onClick={() => setCurrentTab("users")}
              >
                <h3 className="text-xl font-bold mb-2">المستخدمين</h3>
                <p>إدارة حسابات المستخدمين والصلاحيات</p>
              </div>
              <div 
                className="p-6 bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg shadow-md text-white cursor-pointer"
                onClick={() => setCurrentTab("coupons")}
              >
                <h3 className="text-xl font-bold mb-2">كوبونات الخصم</h3>
                <p>إنشاء وإدارة كوبونات خصم للعملاء</p>
              </div>
              <div 
                className="p-6 bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-md text-white cursor-pointer"
                onClick={() => setCurrentTab("contact")}
              >
                <h3 className="text-xl font-bold mb-2">رسائل العملاء</h3>
                <p>عرض وإدارة رسائل التواصل من العملاء</p>
              </div>
              <div 
                className="p-6 bg-gradient-to-r from-teal-600 to-teal-800 rounded-lg shadow-md text-white cursor-pointer"
                onClick={() => setCurrentTab("ads")}
              >
                <h3 className="text-xl font-bold mb-2">الإعلانات</h3>
                <p>إدارة إعلانات وعروض المتجر</p>
              </div>
            </div>
            
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">المنتجات المميزة</h2>
              <FeaturedProductsManagement />
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersPanel />
          </TabsContent>

          <TabsContent value="users">
            <UsersPanel />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManagement />
          </TabsContent>

          <TabsContent value="contact">
            <div className="space-y-8">
              <ContactMessages />
              <AdminContactSettings />
            </div>
          </TabsContent>

          <TabsContent value="ads">
            <AdManagement />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-8">
              <AdminContactSettings />
              {/* Add other settings components here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
