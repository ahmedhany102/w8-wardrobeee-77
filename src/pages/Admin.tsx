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
import CouponManagement from '@/components/admin/CouponManagement';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserRound } from 'lucide-react';
import { formatDistance } from 'date-fns';
import UserDatabase from '@/models/UserDatabase';
import { User } from '@/models/User';
import DOMPurify from 'dompurify';

// Use a different interface name to avoid conflict with imported User
interface UserView {
  id: string;
  email: string;
  name: string;
  role: string;
  status?: string;
  lastLogin?: string;
  password?: string;
}

interface AdminProps {
  activeTab?: string;
}

const Admin = ({ activeTab = "dashboard" }: AdminProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  
  // Function to create default activities if none exist
  const createDefaultActivities = () => {
    const defaultActivities = [
      {
        id: `act-${Date.now()}`,
        description: 'System initialized',
        timestamp: new Date().toISOString(),
        type: 'system'
      }
    ];
    setActivities(defaultActivities);
    localStorage.setItem('activities', JSON.stringify(defaultActivities));
  };
  
  useEffect(() => {
    // Verify admin status on component mount
    if (!user || user.role !== 'ADMIN') {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    
    // Load data from localStorage
    loadUsers();
    loadOrders();
    loadProducts();
    loadCoupons();
    loadActivities();
  }, [user, navigate]);

  // Load users from UserDatabase
  const loadUsers = () => {
    const userDb = UserDatabase.getInstance();
    const allUsers = userDb.getAllUsers();
    // Ensure the users array is correctly typed
    setUsers(allUsers as User[]);
  };

  // Load orders from localStorage with error handling
  const loadOrders = () => {
    try {
      const loadedOrders = localStorage.getItem('orders');
      if (loadedOrders) {
        const parsedOrders = JSON.parse(loadedOrders);
        setOrders(parsedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    }
  };

  // Load products from localStorage with error handling
  const loadProducts = () => {
    try {
      const loadedProducts = localStorage.getItem('products');
      if (loadedProducts) {
        const parsedProducts = JSON.parse(loadedProducts);
        setProducts(parsedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    }
  };

  // Load coupons from localStorage with error handling
  const loadCoupons = () => {
    try {
      const loadedCoupons = localStorage.getItem('coupons');
      if (loadedCoupons) {
        const parsedCoupons = JSON.parse(loadedCoupons);
        setCoupons(parsedCoupons);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error("Error loading coupons:", error);
      setCoupons([]);
    }
  };

  // Load activities from localStorage with error handling
  const loadActivities = () => {
    try {
      const loadedActivities = localStorage.getItem('activities');
      if (loadedActivities) {
        const parsedActivities = JSON.parse(loadedActivities);
        setActivities(parsedActivities);
      } else {
        createDefaultActivities();
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      createDefaultActivities();
    }
  };

  // Record a new activity with sanitization
  const recordActivity = (description: string, type: string = "system") => {
    const sanitizedDescription = DOMPurify.sanitize(description);
    const newActivity = {
      id: `act-${Date.now()}`,
      description: sanitizedDescription,
      timestamp: new Date().toISOString(),
      type,
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 20);
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
    return newActivity;
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    navigate(`/admin${value !== 'dashboard' ? `/${value}` : ''}`);
  };

  const handleMakeAdmin = (userId: string) => {
    const userDb = UserDatabase.getInstance();
    const success = userDb.updateUserRole(userId, 'ADMIN');
    
    if (success) {
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, role: 'ADMIN' as const } : u
      );
      setUsers(updatedUsers);
      
      const targetUser = users.find(u => u.id === userId);
      recordActivity(`User ${targetUser?.name} promoted to Admin role`, "user");
      
      toast.success('User role updated to Admin');
    } else {
      toast.error('Failed to update user role');
    }
  };

  const handleRemoveAdmin = (userId: string) => {
    const userDb = UserDatabase.getInstance();
    const success = userDb.updateUserRole(userId, 'USER');
    
    if (success) {
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, role: 'USER' as const } : u
      );
      setUsers(updatedUsers);
      
      const targetUser = users.find(u => u.id === userId);
      recordActivity(`Admin privileges removed from ${targetUser?.name}`, "user");
      
      toast.success('Admin privileges removed');
    } else {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    
    // Prevent deleting super admin
    if (userToDelete?.isSuperAdmin) {
      toast.error('Cannot delete super admin account');
      return;
    }

    const userDb = UserDatabase.getInstance();
    const success = userDb.deleteUser(userId);
    
    if (success) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      
      recordActivity(`User deleted: ${userToDelete?.name} (${userToDelete?.email})`, "user");
      
      toast.success('User deleted');
    } else {
      toast.error('Failed to delete user');
    }
  };
  
  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    
    // Prevent editing super admin unless current user is super admin
    if (userToEdit?.isSuperAdmin && !user?.isSuperAdmin) {
      toast.error('Only super admin can edit super admin account');
      return;
    }

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
    
    const userToEdit = users.find(u => u.id === isEditing);
    
    // Prevent editing super admin unless current user is super admin
    if (userToEdit?.isSuperAdmin && !user?.isSuperAdmin) {
      toast.error('Only super admin can edit super admin account');
      return;
    }
    
    const userDb = UserDatabase.getInstance();
    const updatedData: Partial<Omit<User, "id" | "password">> = {
      ...editData,
      role: editData.role as 'ADMIN' | 'USER'
    };
    
    const success = userDb.updateUser(isEditing, updatedData);
    
    if (success) {
      const updatedUsers = users.map(u => 
        u.id === isEditing ? { ...u, ...editData, role: editData.role as 'ADMIN' | 'USER' } : u
      );
      
      setUsers(updatedUsers);
      recordActivity(`User information updated: ${editData.name} (${editData.email})`, "user");
      
      setIsEditing(null);
      setEditData({});
      toast.success('User information updated');
    } else {
      toast.error('Failed to update user information');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Sanitize input before setting state
    const sanitizedValue = DOMPurify.sanitize(value);
    setEditData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleStatusChange = (userId: string, status: 'ACTIVE' | 'BLOCKED' | 'PENDING') => {
    const userDb = UserDatabase.getInstance();
    const success = userDb.updateUserStatus(userId, status);
    
    if (success) {
      const userToUpdate = users.find(u => u.id === userId);
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, status } : u
      );
      setUsers(updatedUsers);
      
      recordActivity(`User status updated: ${userToUpdate?.name} is now ${status}`, "user");
      
      toast.success(`User status updated to ${status}`);
    } else {
      toast.error('Failed to update user status');
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (error) {
      return "unknown time";
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out from admin panel');
    navigate('/admin-login');
  };

  return (
    <div className="w-full px-2 sm:px-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            Logout
          </Button>
        </div>
        
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
              <TabsTrigger 
                value="coupons" 
                className="flex-1 data-[state=active]:bg-green-200 data-[state=active]:text-green-800"
              >
                Coupons
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 md:gap-6 mb-6">
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                  <CardTitle>Total Users</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 dark:bg-gray-800 dark:text-white">
                  <p className="text-2xl md:text-3xl font-bold">{users.length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                  <CardTitle>Admins</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 dark:bg-gray-800 dark:text-white">
                  <p className="text-2xl md:text-3xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                  <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 dark:bg-gray-800 dark:text-white">
                  <p className="text-2xl md:text-3xl font-bold">{orders.length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                  <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 dark:bg-gray-800 dark:text-white">
                  <p className="text-2xl md:text-3xl font-bold">{products.length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                  <CardTitle>Coupons</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 dark:bg-gray-800 dark:text-white">
                  <p className="text-2xl md:text-3xl font-bold">{coupons.length}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="hover:shadow-lg transition-all mb-4">
              <CardHeader className="bg-gradient-to-r from-green-900 to-black text-white rounded-t-md py-3">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription className="text-white/80">Latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 dark:bg-gray-800">
                <div className="space-y-4">
                  {activities.length > 0 ? (
                    activities.slice(0, 10).map(activity => (
                      <div key={activity.id} className="flex items-center border-b pb-2 dark:border-gray-700">
                        <div className="ml-0 sm:ml-4 w-full">
                          <div className="flex justify-between w-full">
                            <p className="font-medium dark:text-white">{activity.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">No recent activities</p>
                  )}
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
                <div className="table-container w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-green-50 dark:bg-green-900/20">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id} className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                          {isEditing === user.id ? (
                            // Edit mode
                            <>
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
                                <div className="flex items-center">
                                  <input 
                                    type={showPassword[user.id] ? "text" : "password"} 
                                    name="password" 
                                    value={editData.password || ''} 
                                    onChange={handleInputChange}
                                    className="w-full p-1 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                  />
                                  <button
                                    onClick={() => togglePasswordVisibility(user.id)}
                                    className="ml-2 focus:outline-none"
                                    type="button"
                                  >
                                    {showPassword[user.id] ? (
                                      <EyeOff size={16} className="text-gray-500" />
                                    ) : (
                                      <Eye size={16} className="text-gray-500" />
                                    )}
                                  </button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <select 
                                  name="role" 
                                  value={editData.role || 'USER'} 
                                  onChange={(e) => setEditData({...editData, role: e.target.value as 'ADMIN' | 'USER'})}
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
                                  onChange={(e) => setEditData({...editData, status: e.target.value as 'ACTIVE' | 'BLOCKED' | 'PENDING'})}
                                  className="w-full p-1 border rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                                >
                                  <option value="ACTIVE">ACTIVE</option>
                                  <option value="BLOCKED">BLOCKED</option>
                                  <option value="PENDING">PENDING</option>
                                </select>
                              </TableCell>
                              <TableCell>
                                {user.lastLogin ? formatTimeAgo(user.lastLogin) : 'Never'}
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:text-white"
                                >
                                  Save
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  className="bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:text-white"
                                >
                                  Cancel
                                </Button>
                              </TableCell>
                            </>
                          ) : (
                            // View mode
                            <>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {showPassword[user.id] ? user.password : '••••••••'}
                                  </span>
                                  <button 
                                    onClick={() => togglePasswordVisibility(user.id)} 
                                    className="ml-1 text-xs text-blue-500 focus:outline-none"
                                  >
                                    {showPassword[user.id] ? (
                                      <EyeOff size={16} className="text-gray-500" />
                                    ) : (
                                      <Eye size={16} className="text-gray-500" />
                                    )}
                                  </button>
                                </div>
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
                              <TableCell>
                                {user.lastLogin ? formatTimeAgo(user.lastLogin) : 'Never'}
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
          
          <TabsContent value="coupons">
            <CouponManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
