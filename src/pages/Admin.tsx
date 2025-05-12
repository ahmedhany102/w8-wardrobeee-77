
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OrdersPanel from '@/components/admin/OrdersPanel';
import ProductManagement from '@/components/admin/ProductManagement';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AdminProps {
  activeTab?: string;
}

const Admin = ({ activeTab = "dashboard" }: AdminProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    // Load mock users from localStorage
    const loadedUsers = localStorage.getItem('users');
    if (loadedUsers) {
      setUsers(JSON.parse(loadedUsers));
    } else {
      // Create mock users
      const mockUsers = [
        {
          id: 'user-1',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          ipAddress: '192.168.1.1'
        },
        {
          id: 'user-2',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
          createdAt: new Date().toISOString(),
          ipAddress: '192.168.1.2'
        },
        {
          id: 'user-3',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'USER',
          createdAt: new Date().toISOString(),
          ipAddress: '192.168.1.3'
        }
      ];
      setUsers(mockUsers);
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }
  }, []);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    navigate(`/admin${value !== 'dashboard' ? `/${value}` : ''}`);
  };

  const handleMakeAdmin = (userId: string) => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, role: 'ADMIN' } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('User role updated to Admin');
  };

  const handleRemoveAdmin = (userId: string) => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, role: 'USER' } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('Admin privileges removed');
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('User deleted');
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue={currentTab} value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-gradient-to-r from-green-900 to-black mb-6 w-full flex justify-between">
            <TabsTrigger 
              value="dashboard" 
              className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800 hover:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800 hover:text-white"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800 hover:text-white"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800 hover:text-white"
            >
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
                  <CardTitle>Total Users</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold">{users.length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
                  <CardTitle>Admins</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
                  <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold">12</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
                  <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold">24</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription className="text-white/80">Latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center border-b pb-2">
                    <div className="ml-4">
                      <p className="font-medium">New user registered: John Doe</p>
                      <p className="text-sm text-gray-500">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center border-b pb-2">
                    <div className="ml-4">
                      <p className="font-medium">New order placed: #ORD-12345</p>
                      <p className="text-sm text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center border-b pb-2">
                    <div className="ml-4">
                      <p className="font-medium">Product stock low: Egyptian Koshari (5 left)</p>
                      <p className="text-sm text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md">
                <CardTitle>User Management</CardTitle>
                <CardDescription className="text-white/80">Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-green-50">
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id} className="hover:bg-green-50">
                          <TableCell className="font-medium">{user.id.substring(0, 10)}...</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'ADMIN' ? 'bg-green-800 text-white hover:bg-green-700' : 'bg-blue-500 text-white hover:bg-blue-400'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{user.ipAddress}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:bg-green-100 hover:text-green-800"
                            >
                              Edit
                            </Button>
                            {user.role !== 'ADMIN' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleMakeAdmin(user.id)}
                                className="hover:bg-green-100 hover:text-green-800"
                              >
                                Make Admin
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRemoveAdmin(user.id)}
                                className="hover:bg-yellow-100 hover:text-yellow-800"
                              >
                                Remove Admin
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="hover:bg-red-100 hover:text-red-800 text-red-500"
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <OrdersPanel />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
