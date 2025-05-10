
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersPanel from "@/components/admin/OrdersPanel";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
}

const API_URL = "http://localhost:8080/api";
const ADMIN_EMAIL = "ahmedhanyseifeldin@gmail.com"; // Hardcoded admin email

const editUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["ROLE_USER", "ROLE_ADMIN"]),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "ROLE_USER",
    },
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedUser) {
      form.reset({
        email: selectedUser.email,
        name: selectedUser.name || "",
        role: selectedUser.role as "ROLE_USER" | "ROLE_ADMIN",
      });
    }
  }, [selectedUser, form]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // This would be a real API call in a production app
      // Mocking the response for this demo
      const mockUsers: User[] = [
        {
          id: "1",
          email: "ahmedhanyseifeldin@gmail.com",
          name: "Ahmed Hany",
          role: "ROLE_ADMIN",
          createdAt: new Date().toISOString(),
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        {
          id: "2",
          email: "user1@example.com",
          name: "Regular User",
          role: "ROLE_USER",
          createdAt: new Date().toISOString(),
          ipAddress: "192.168.1.2",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        },
        {
          id: "3",
          email: "user2@example.com",
          name: "Another User",
          role: "ROLE_USER",
          createdAt: new Date().toISOString(),
          ipAddress: "192.168.1.3",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("An error occurred while fetching users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    // Prevent admin from deleting their own account
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.email === ADMIN_EMAIL) {
      toast.error("Cannot delete the admin account");
      return;
    }

    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        // In a real app, this would call an API endpoint
        // Simulating successful deletion
        setUsers(users.filter(u => u.id !== userId));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const onSubmit = async (data: EditUserFormValues) => {
    if (!selectedUser) return;

    // Prevent admin from changing their own role from admin to user
    if (selectedUser.email === ADMIN_EMAIL && data.role !== "ROLE_ADMIN") {
      toast.error("Cannot change the admin role for the main administrator account");
      return;
    }

    try {
      // In a real app, this would call an API endpoint
      // For this demo, we're updating the state directly
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              email: data.email, 
              name: data.name, 
              role: data.role 
            } 
          : u
      ));
      
      toast.success("User updated successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    toast.error("You don't have permission to view this page");
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-t-md">
            <CardTitle className="text-2xl flex items-center justify-between">
              <span>Admin Panel</span>
              <span className="text-sm bg-white text-purple-800 px-3 py-1 rounded-full animate-pulse">
                👑 Secure Admin Session
              </span>
            </CardTitle>
            <CardDescription className="text-gray-100">
              Manage users, orders, and system settings
            </CardDescription>
          </CardHeader>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-6 pt-6">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800"
                >
                  User Management
                </TabsTrigger>
                <TabsTrigger 
                  value="orders"
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800"
                >
                  Order Management
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="users" className="pt-2">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-purple-700">Users List</h2>
                  <Button 
                    onClick={fetchUsers} 
                    variant="outline"
                    className="border-purple-300 hover:bg-purple-50 transition-all"
                  >
                    Refresh
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden transition-all duration-300 hover:shadow-md">
                    <Table>
                      <TableHeader className="bg-purple-100">
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
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center h-24 text-muted-foreground"
                            >
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((userData) => (
                            <TableRow key={userData.id} className="hover:bg-purple-50 transition-colors">
                              <TableCell className="font-medium">
                                {userData.id.length > 8 ? `${userData.id.substring(0, 8)}...` : userData.id}
                              </TableCell>
                              <TableCell>{userData.name}</TableCell>
                              <TableCell>{userData.email}</TableCell>
                              <TableCell>{userData.role.replace('ROLE_', '')}</TableCell>
                              <TableCell>
                                {new Date(userData.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{userData.ipAddress}</TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(userData)}
                                  className="border-purple-300 hover:bg-purple-50 transition-all"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(userData.id)}
                                  disabled={userData.email === ADMIN_EMAIL}
                                  className="hover:bg-red-600 transition-all"
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </TabsContent>
            
            <TabsContent value="orders">
              <OrdersPanel />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-purple-700">Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user account. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="transition-all hover:border-purple-300 focus:ring-purple-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} className="transition-all hover:border-purple-300 focus:ring-purple-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ROLE_USER" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            User
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem 
                              value="ROLE_ADMIN"
                              disabled={selectedUser?.email !== ADMIN_EMAIL && selectedUser?.role !== "ROLE_ADMIN"}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Admin
                            {selectedUser?.email !== ADMIN_EMAIL && selectedUser?.role !== "ROLE_ADMIN" && 
                              " (Only the main admin can have this role)"}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="transition-all hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 transition-all hover:scale-105 active:scale-95"
                >
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminPage;
