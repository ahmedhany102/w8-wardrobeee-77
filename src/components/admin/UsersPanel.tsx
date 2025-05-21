
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import UserDatabase from '@/models/UserDatabase';
import { Plus } from 'lucide-react';

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  status: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const UsersPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const db = UserDatabase.getInstance();
      const allUsers = await db.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('حدث خطأ أثناء جلب بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockUser = async (userId: string | undefined, isCurrentlyBlocked: boolean) => {
    if (!userId) return;
    
    try {
      const db = UserDatabase.getInstance();
      await db.updateUser(userId, { isBlocked: !isCurrentlyBlocked });
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBlocked: !isCurrentlyBlocked } : user
      ));
      
      toast.success(`تم ${!isCurrentlyBlocked ? 'حظر' : 'إلغاء حظر'} المستخدم بنجاح`);
    } catch (error) {
      console.error('Error toggling user block status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المستخدم');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    
    try {
      const db = UserDatabase.getInstance();
      
      // Check if email already exists
      const existingUser = await db.getUserById(newAdmin.email);
      if (existingUser) {
        toast.error('البريد الإلكتروني مستخدم بالفعل');
        return;
      }
      
      // Create new admin user
      await db.createAdminUser(newAdmin.name, newAdmin.email, newAdmin.password);
      
      toast.success('تم إنشاء حساب المسؤول بنجاح');
      setShowAddAdminDialog(false);
      setNewAdmin({ name: '', email: '', password: '' });
      
      // Refresh user list
      fetchUsers();
      
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error('حدث خطأ أثناء إنشاء حساب المسؤول');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
        <Button 
          onClick={() => setShowAddAdminDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          إضافة مسؤول جديد
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      لا يوجد مستخدمين حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isSuperAdmin 
                          ? 'مدير أعلى' 
                          : (user.isAdmin ? 'مدير' : 'مستخدم')}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.isBlocked 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isBlocked ? 'محظور' : 'نشط'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {!user.isSuperAdmin && (
                          <Button 
                            onClick={() => toggleBlockUser(user.id, user.isBlocked)}
                            variant={user.isBlocked ? "outline" : "destructive"}
                            size="sm"
                          >
                            {user.isBlocked ? 'إلغاء الحظر' : 'حظر'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة مسؤول جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات المسؤول الجديد. سوف يتمكن من الوصول إلى لوحة التحكم.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleInputChange}
                  placeholder="اسم المسؤول"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={handleInputChange}
                  placeholder="example@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newAdmin.password}
                  onChange={handleInputChange}
                  placeholder="******"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">إضافة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPanel;
