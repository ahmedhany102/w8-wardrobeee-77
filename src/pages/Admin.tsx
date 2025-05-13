
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
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  
  useEffect(() => {
    // Load mock users from localStorage or create default users if none exist
    const loadUsers = () => {
      const loadedUsers = localStorage.getItem('users');
      if (loadedUsers) {
        try {
          const parsedUsers = JSON.parse(loadedUsers);
          setUsers(parsedUsers);
        } catch (error) {
          console.error("Error parsing users:", error);
          createDefaultUsers();
        }
      } else {
        createDefaultUsers();
      }
    };
    
    // Create mock users with the required admin account
    const createDefaultUsers = () => {
      const currentDate = new Date().toISOString();
      const mockUsers = [
        {
          id: 'admin-1',
          name: 'Ahmed Hany',
          email: 'ahmedhanyseifeldein@gmail.com',
          password: 'password123', // This would be encrypted in a real app
          role: 'ADMIN',
          createdAt: currentDate,
          ipAddress: '192.168.1.1',
          status: 'ACTIVE'
        },
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'userpass123', // This would be encrypted in a real app
          role: 'USER',
          createdAt: currentDate,
          ipAddress: '192.168.1.2',
          status: 'ACTIVE'
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'janepass456', // This would be encrypted in a real app
          role: 'USER',
          createdAt: currentDate,
          ipAddress: '192.168.1.3',
          status: 'ACTIVE'
        }
      ];
      setUsers(mockUsers);
      localStorage.setItem('users', JSON.stringify(mockUsers));
    };
    
    loadUsers();
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
  
  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setIsEditing(userId);
      setEditData({ ...userToEdit });
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditData({});
  };
  
  const handleSaveEdit = () => {
    if (!isEditing) return;
    
    const updatedUsers = users.map(u => 
      u.id === isEditing ? { ...editData } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setIsEditing(null);
    setEditData({});
    toast.success('User information updated');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (userId: string, status: string) => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, status } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success(`User status updated to ${status}`);
  };

  return (
    <Layout>
      <div className="w-full px-2 sm:px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue={currentTab} value={currentTab} onValueChange={handleTabChange} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="bg-gradient-to-r from-green-900 to-black mb-4 md:mb-6 w-full flex justify-between overflow-x-auto">
              <TabsTrigger 
                value="dashboard" 
                className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
              >
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
              >
                Products
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-6">
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                  <CardTitle>Total Users</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-2xl md:text-3xl font-bold">{users.length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                  <CardTitle>Admins</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-2xl md:text-3xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                  <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-2xl md:text-3xl font-bold">12</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                  <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-2xl md:text-3xl font-bold">24</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="hover:shadow-lg transition-all mb-4">
              <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription className="text-white/80">Latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center border-b pb-2">
                    <div className="ml-0 sm:ml-4">
                      <p className="font-medium">New user registered: John Doe</p>
                      <p className="text-sm text-gray-500">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center border-b pb-2">
                    <div className="ml-0 sm:ml-4">
                      <p className="font-medium">New order placed: #ORD-12345</p>
                      <p className="text-sm text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center border-b pb-2">
                    <div className="ml-0 sm:ml-4">
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
              <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                <CardTitle>User Management</CardTitle>
                <CardDescription className="text-white/80">Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="table-container">
                  <Table>
                    <TableHeader className="bg-green-50 dark:bg-green-900/20">
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id}>
                          {isEditing === user.id ? (
                            // Edit mode
                            <>
                              <TableCell>{user.id.substring(0, 6)}...</TableCell>
                              <TableCell>
                                <input 
                                  type="text" 
                                  name="name" 
                                  value={editData.name || ''} 
                                  onChange={handleInputChange}
                                  className="w-full p-1 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                />
                              </TableCell>
                              <TableCell>
                                <input 
                                  type="email" 
                                  name="email" 
                                  value={editData.email || ''} 
                                  onChange={handleInputChange}
                                  className="w-full p-1 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                />
                              </TableCell>
                              <TableCell>
                                <input 
                                  type="text" 
                                  name="password" 
                                  value={editData.password || ''} 
                                  onChange={handleInputChange}
                                  className="w-full p-1 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                />
                              </TableCell>
                              <TableCell>
                                <select 
                                  name="role" 
                                  value={editData.role || 'USER'} 
                                  onChange={(e) => setEditData({...editData, role: e.target.value})}
                                  className="w-full p-1 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                >
                                  <option value="USER">USER</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </TableCell>
                              <TableCell>
                                <select 
                                  name="status" 
                                  value={editData.status || 'ACTIVE'} 
                                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                                  className="w-full p-1 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                >
                                  <option value="ACTIVE">ACTIVE</option>
                                  <option value="BLOCKED">BLOCKED</option>
                                  <option value="PENDING">PENDING</option>
                                </select>
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  className="bg-green-600 text-white hover:bg-green-700"
                                >
                                  Save
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  className="bg-gray-500 text-white hover:bg-gray-600"
                                >
                                  Cancel
                                </Button>
                              </TableCell>
                            </>
                          ) : (
                            // View mode
                            <>
                              <TableCell className="font-medium">{user.id.substring(0, 6)}...</TableCell>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <span className="text-gray-500">
                                  ••••••••
                                  <button 
                                    onClick={() => toast.info(`Password: ${user.password}`)} 
                                    className="ml-1 text-xs text-blue-500"
                                  >
                                    Show
                                  </button>
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={user.role === 'ADMIN' ? 'bg-green-800 text-white' : 'bg-blue-500 text-white'}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  user.status === 'ACTIVE' ? 'bg-green-600 text-white' : 
                                  user.status === 'BLOCKED' ? 'bg-red-600 text-white' : 
                                  'bg-yellow-600 text-white'
                                }>
                                  {user.status || 'ACTIVE'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditUser(user.id)}
                                  className="hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900 dark:hover:text-green-200"
                                >
                                  Edit
                                </Button>
                                {user.role !== 'ADMIN' ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleMakeAdmin(user.id)}
                                    className="hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900 dark:hover:text-green-200"
                                  >
                                    Make Admin
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleRemoveAdmin(user.id)}
                                    className="hover:bg-yellow-100 hover:text-yellow-800 dark:hover:bg-yellow-900 dark:hover:text-yellow-200"
                                  >
                                    Remove Admin
                                  </Button>
                                )}
                                {user.status !== 'BLOCKED' ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleStatusChange(user.id, 'BLOCKED')}
                                    className="hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900 dark:hover:text-red-200 text-red-500"
                                  >
                                    Block
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                    className="hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900 dark:hover:text-green-200 text-green-500"
                                  >
                                    Unblock
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900 dark:hover:text-red-200 text-red-500"
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </>
                          )}
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
