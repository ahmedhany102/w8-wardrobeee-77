
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductManagement from '@/components/admin/ProductManagement';
import OrdersPanel from '@/components/admin/OrdersPanel';
import UsersPanel from '@/components/admin/UsersPanel';
import AdminContactSettings from '@/components/admin/AdminContactSettings';
import CouponManagement from '@/components/admin/CouponManagement';
import AdManagement from '@/components/admin/AdManagement';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  Settings, 
  Tag,
  ImageIcon
} from 'lucide-react';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-green-800">Loading admin panel...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { id: 'products', name: 'Products', icon: Package },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'coupons', name: 'Coupons', icon: Tag },
    { id: 'ads', name: 'Ads', icon: ImageIcon },
    { id: 'settings', name: 'Contact Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrdersPanel />;
      case 'users':
        return <UsersPanel />;
      case 'coupons':
        return <CouponManagement />;
      case 'ads':
        return <AdManagement />;
      case 'settings':
        return <AdminContactSettings />;
      default:
        return <ProductManagement />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="text-sm text-gray-600">
                Welcome, {user.email}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64">
              <div className="bg-white rounded-lg shadow p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === tab.id
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
