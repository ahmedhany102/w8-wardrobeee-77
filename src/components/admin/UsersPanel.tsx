
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "@/components/ui/loader";
import UserDatabase from "@/models/UserDatabase";
import { toast } from "sonner";
import { User } from "@/models/User";

const UsersPanel: React.FC = () => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Omit<User, 'password'>[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const db = UserDatabase.getInstance();
      const allUsers = db.getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: string, role: "ADMIN" | "USER") => {
    try {
      const db = UserDatabase.getInstance();
      const success = await db.updateUserRole(userId, role);
      if (success) {
        toast.success(`User role updated successfully`);
        loadUsers();
      } else {
        toast.error("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleStatusChange = async (userId: string, status: "ACTIVE" | "BLOCKED" | "PENDING") => {
    try {
      const db = UserDatabase.getInstance();
      const success = await db.updateUserStatus(userId, status);
      if (success) {
        toast.success(`User status updated successfully`);
        loadUsers();
      } else {
        toast.error("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const db = UserDatabase.getInstance();
      const success = db.deleteUser(userId);
      if (success) {
        toast.success("User deleted successfully");
        loadUsers();
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
        <div className="w-full md:w-1/3">
          <Input
            placeholder="البحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader size="lg" className="mx-auto my-10" />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">لا يوجد مستخدمين</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <CardTitle className="text-lg">
                      {user.name || "بدون اسم"} {user.isSuperAdmin && " (Super Admin)"}
                    </CardTitle>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الحالة</p>
                      <Select
                        value={user.status}
                        onValueChange={(value) =>
                          handleStatusChange(user.id, value as "ACTIVE" | "BLOCKED" | "PENDING")
                        }
                        disabled={user.isSuperAdmin}
                      >
                        <SelectTrigger className={
                          user.status === "ACTIVE" 
                            ? "bg-green-100 border-green-300"
                            : user.status === "BLOCKED" 
                              ? "bg-red-100 border-red-300" 
                              : "bg-yellow-100 border-yellow-300"
                        }>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">نشط</SelectItem>
                          <SelectItem value="BLOCKED">محظور</SelectItem>
                          <SelectItem value="PENDING">معلق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الدور</p>
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value as "ADMIN" | "USER")
                        }
                        disabled={user.isSuperAdmin}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">مدير</SelectItem>
                          <SelectItem value="USER">مستخدم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">تاريخ الإنشاء</p>
                      <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">آخر دخول</p>
                      <p>{new Date(user.lastLogin).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {!user.isSuperAdmin && (
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="destructive"
                        onClick={() => deleteUser(user.id)}
                      >
                        حذف المستخدم
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UsersPanel;
