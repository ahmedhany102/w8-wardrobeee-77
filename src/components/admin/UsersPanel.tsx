
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import UserDatabase from '@/models/UserDatabase';

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إدارة المستخدمين</CardTitle>
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
    </div>
  );
};

export default UsersPanel;
