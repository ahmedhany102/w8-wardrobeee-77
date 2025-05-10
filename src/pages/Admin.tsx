
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
      <div className="max-w-5xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <CardDescription>
              Manage users and system settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button onClick={fetchUsers} variant="outline">
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
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
                        <TableRow key={userData.id}>
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
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(userData.id)}
                              disabled={userData.email === ADMIN_EMAIL}
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
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                >
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminPage;
