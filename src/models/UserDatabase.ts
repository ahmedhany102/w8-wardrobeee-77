
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, isValidRole, isValidStatus } from '@/models/User';
import { supabase } from '@/integrations/supabase/client';

class UserDatabase {
  private static instance: UserDatabase;
  private readonly SALT_ROUNDS = 10;

  private constructor() {}

  public static getInstance(): UserDatabase {
    if (!UserDatabase.instance) {
      UserDatabase.instance = new UserDatabase();
    }
    return UserDatabase.instance;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public async addUser(userData: Partial<User>): Promise<User | null> {
    try {
      if (!userData.email || !this.validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Register user with Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || '',
        options: {
          data: {
            name: userData.name || ''
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Ensure role is valid
      const userRole = isValidRole(userData.role || 'USER') ? userData.role || 'USER' : 'USER';
      
      // Profile will be automatically created via trigger
      // Let's ensure the is_admin value is set correctly
      if (userRole === 'ADMIN') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            is_admin: true,
            role: 'ADMIN'
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Error updating admin status:', updateError);
        }
      }

      // Return the user without password
      return {
        id: authData.user.id,
        email: authData.user.email || '',
        name: userData.name || '',
        role: userRole,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        ipAddress: '0.0.0.0',
        status: 'ACTIVE',
        isAdmin: userRole === 'ADMIN',
        isSuperAdmin: userData.isSuperAdmin || false,
        isBlocked: false
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return null;
    }
  }

  public async createAdminUser(name: string, email: string, password: string): Promise<User | null> {
    try {
      if (!email || !this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Register user with Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create admin user');
      }

      // Update the profile to make them an admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_admin: true,
          role: 'ADMIN'
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Error setting admin privileges:', updateError);
      }

      // Return the admin user without password
      return {
        id: authData.user.id,
        email: authData.user.email || '',
        name: name,
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        ipAddress: '0.0.0.0',
        status: 'ACTIVE',
        isAdmin: true,
        isSuperAdmin: false,
        isBlocked: false
      };
    } catch (error) {
      console.error('Error creating admin user:', error);
      return null;
    }
  }

  public async loginUser(email: string, password: string): Promise<User | null> {
    try {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('Login error:', error);
        return null;
      }

      if (!data.user) {
        console.log('No user found');
        return null;
      }

      // Get the user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      // Update last login time
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      // Ensure role and status have valid values
      const role = isValidRole(profile.role) ? profile.role : 'USER';
      const status = isValidStatus(profile.status) ? profile.status : 'ACTIVE';

      // Return user data without password
      return {
        id: data.user.id,
        email: data.user.email || '',
        name: profile.name || '',
        role,
        createdAt: profile.created_at,
        lastLogin: new Date().toISOString(),
        ipAddress: profile.ip_address || '0.0.0.0',
        status,
        isAdmin: profile.is_admin || false,
        isSuperAdmin: profile.is_super_admin || false,
        isBlocked: profile.is_blocked || false
      };
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  }

  public async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data.map(profile => {
        // Ensure role and status have valid values
        const role = isValidRole(profile.role) ? profile.role : 'USER';
        const status = isValidStatus(profile.status) ? profile.status : 'ACTIVE';

        return {
          id: profile.id,
          email: profile.email || '',
          name: profile.name || '',
          role,
          createdAt: profile.created_at,
          lastLogin: profile.last_login,
          ipAddress: profile.ip_address || '0.0.0.0',
          status,
          isAdmin: profile.is_admin || false,
          isSuperAdmin: profile.is_super_admin || false,
          isBlocked: profile.is_blocked || false
        };
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  public async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        console.error('Error fetching user by ID:', error);
        return null;
      }

      // Ensure role and status have valid values
      const role = isValidRole(data.role) ? data.role : 'USER';
      const status = isValidStatus(data.status) ? data.status : 'ACTIVE';

      return {
        id: data.id,
        email: data.email || '',
        name: data.name || '',
        role,
        createdAt: data.created_at,
        lastLogin: data.last_login,
        ipAddress: data.ip_address || '0.0.0.0',
        status,
        isAdmin: data.is_admin || false,
        isSuperAdmin: data.is_super_admin || false,
        isBlocked: data.is_blocked || false
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    try {
      const dbUpdates: any = {};

      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) {
        if (!this.validateEmail(updates.email)) {
          throw new Error('Invalid email format');
        }
        // Check if email is already in use by another user
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', updates.email)
          .neq('id', id)
          .maybeSingle();

        if (existingUser) {
          throw new Error('Email already in use');
        }

        dbUpdates.email = updates.email;
      }
      if (updates.role && isValidRole(updates.role)) dbUpdates.role = updates.role;
      if (updates.status && isValidStatus(updates.status)) dbUpdates.status = updates.status;
      if (updates.isAdmin !== undefined) dbUpdates.is_admin = updates.isAdmin;
      if (updates.isSuperAdmin !== undefined) dbUpdates.is_super_admin = updates.isSuperAdmin;
      if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;
      if (updates.ipAddress) dbUpdates.ip_address = updates.ipAddress;

      // If password is being updated, handle that separately with Auth API
      if (updates.password) {
        // This would require admin privileges, not implementing here
        console.log('Password updates require admin privileges');
      }

      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  public async updateUserRole(id: string, role: 'ADMIN' | 'USER'): Promise<boolean> {
    return this.updateUser(id, { 
      role,
      isAdmin: role === 'ADMIN'
    });
  }

  public async updateUserStatus(id: string, status: 'ACTIVE' | 'BLOCKED' | 'PENDING'): Promise<boolean> {
    return this.updateUser(id, { 
      status,
      isBlocked: status === 'BLOCKED'
    });
  }

  public async deleteUser(id: string): Promise<boolean> {
    try {
      // Check if user is a super admin
      const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user for deletion check:', fetchError);
        return false;
      }

      if (user?.is_super_admin) {
        console.error('Cannot delete super admin user');
        return false;
      }

      // Delete the user from Auth (will cascade to profiles due to foreign key)
      // Note: This requires admin privileges 
      // For regular operation, use admin functions or server-side code
      const { error: deleteError } = await supabase.auth.admin.deleteUser(id);

      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

export default UserDatabase;
