
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash } from 'lucide-react';
import { useSupabaseUsers } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';

const UsersPanel = () => {
  const { users, loading, updateUser, deleteUser, refetch } = useSupabaseUsers();
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });

  const toggleBlockUser = async (userId, isCurrentlyBlocked) => {
    if (!userId) return;
    
    try {
      await updateUser(userId, { is_blocked: !isCurrentlyBlocked });
      toast.success(`تم ${!isCurrentlyBlocked ? 'حظر' : 'إلغاء حظر'} المستخدم بنجاح`);
    } catch (error) {
      console.error('Error toggling user block status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المستخدم');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete);
      toast.success('تم حذف المستخدم بنجاح');
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('حدث خطأ أثناء حذف المستخدم');
      setShowDeleteDialog(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    
    try {
      // Create admin user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            name: newAdmin.name
          }
        }
      });

      if (authError) {
        console.error('Error creating admin user:', authError);
        toast.error('حدث خطأ أثناء إنشاء حساب المسؤول');
        return;
      }

      // Update the profile to be admin
      if (authData.user) {
        await updateUser(authData.user.id, {
          name: newAdmin.name,
          email: newAdmin.email,
          role: 'ADMIN',
          is_admin: true,
          is_super_admin: false
        });
      }
      
      toast.success('تم إنشاء حساب المسؤول بنجاح');
      setShowAddAdminDialog(false);
      setNewAdmin({ name: '', email: '', password: '' });
      refetch();
      
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error('حدث خطأ أثناء إنشاء حساب المسؤول');
    }
  };

  const handleInputChange = (e) => {
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
          <CardTitle>المستخدمين - Total: {users.length}</CardTitle>
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
                        {user.is_super_admin 
                          ? 'مدير أعلى' 
                          : (user.is_admin ? 'مدير' : 'مستخدم')}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.is_blocked 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.is_blocked ? 'محظور' : 'نشط'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!user.is_super_admin && (
                            <>
                              <Button 
                                onClick={() => toggleBlockUser(user.id, user.is_blocked)}
                                variant={user.is_blocked ? "outline" : "destructive"}
                                size="sm"
                              >
                                {user.is_blocked ? 'إلغاء الحظر' : 'حظر'}
                              </Button>
                              <Button
                                onClick={() => {
                                  setUserToDelete(user.id);
                                  setShowDeleteDialog(true);
                                }}
                                variant="destructive"
                                size="sm"
                                className="ml-2 bg-red-600 hover:bg-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
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
      
      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد حذف المستخدم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد حذف هذا المستخدم بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setShowDeleteDialog(false)} 
              variant="outline"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleDeleteUser}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              حذف نهائياً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPanel;
