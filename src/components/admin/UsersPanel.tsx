
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import UserDatabase from '@/models/UserDatabase';
import { Plus, Trash } from 'lucide-react';
import { User as UserModel } from '@/models/User';
import { supabase } from '@/integrations/supabase/client';

const UsersPanel = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
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
      
      // Fetch users directly from Supabase profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Map the data to match our UserModel structure
      const formattedUsers: UserModel[] = data.map((profile: any) => ({
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        role: profile.role || 'USER',
        isBlocked: profile.is_blocked || false,
        status: profile.status || 'ACTIVE',
        isAdmin: profile.is_admin || false,
        isSuperAdmin: profile.is_super_admin || false,
        createdAt: profile.created_at || new Date().toISOString(),
        lastLogin: profile.last_login || new Date().toISOString(),
        ipAddress: profile.ip_address || ''
      }));
      
      setUsers(formattedUsers);
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
      // Update directly in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_blocked: !isCurrentlyBlocked,
          status: !isCurrentlyBlocked ? 'BLOCKED' : 'ACTIVE'
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBlocked: !isCurrentlyBlocked, status: !isCurrentlyBlocked ? 'BLOCKED' : 'ACTIVE' } : user
      ));
      
      toast.success(`تم ${!isCurrentlyBlocked ? 'حظر' : 'إلغاء حظر'} المستخدم بنجاح`);
    } catch (error) {
      console.error('Error toggling user block status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المستخدم');
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Delete directly from Supabase
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete);
      
      if (error) {
        throw error;
      }
      
      // Remove the user from the local state
      setUsers(users.filter(user => user.id !== userToDelete));
      toast.success('تم حذف المستخدم بنجاح');
      
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('حدث خطأ أثناء حذف المستخدم');
      setShowDeleteDialog(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    
    try {
      // Create new user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            name: newAdmin.name,
            is_admin: true
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      // Make sure the user profile has admin privileges
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            is_admin: true, 
            name: newAdmin.name,
            role: 'ADMIN'
          })
          .eq('id', authData.user.id);
          
        if (updateError) {
          console.error('Error updating admin status:', updateError);
        }
      }
      
      toast.success('تم إنشاء حساب المسؤول بنجاح');
      setShowAddAdminDialog(false);
      setNewAdmin({ name: '', email: '', password: '' });
      
      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast.error(error.message || 'حدث خطأ أثناء إنشاء حساب المسؤول');
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
                        <div className="flex space-x-2">
                          {!user.isSuperAdmin && (
                            <>
                              <Button 
                                onClick={() => toggleBlockUser(user.id, user.isBlocked)}
                                variant={user.isBlocked ? "outline" : "destructive"}
                                size="sm"
                              >
                                {user.isBlocked ? 'إلغاء الحظر' : 'حظر'}
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
              onClick={deleteUser}
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
