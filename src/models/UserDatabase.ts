import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/models/User';

class UserDatabase {
  private static instance: UserDatabase;
  private users: User[] = [];
  private readonly SALT_ROUNDS = 10;

  private constructor() {
    this.loadUsers();
  }

  public static getInstance(): UserDatabase {
    if (!UserDatabase.instance) {
      UserDatabase.instance = new UserDatabase();
    }
    return UserDatabase.instance;
  }

  private loadUsers(): void {
    try {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.createDefaultAdmin();
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.createDefaultAdmin();
    }
  }

  private createDefaultAdmin(): void {
    const adminUser: User = {
      id: 'admin-1',
      name: 'Ahmed Hany',
      email: 'ahmedhanyseifeldien@gmail.com',
      password: 'Ahmedhany11*',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      status: 'ACTIVE',
      isAdmin: true,
      isSuperAdmin: true,
      isBlocked: false
    };
    this.users = [adminUser];
    this.saveUsers();
  }

  private saveUsers(): void {
    try {
      localStorage.setItem('users', JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
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

  public async registerUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'ipAddress'>): Promise<boolean> {
    try {
      if (!this.validateEmail(userData.email)) {
        throw new Error('Invalid email format');
      }

      if (!this.validatePassword(userData.password)) {
        throw new Error('Password does not meet security requirements');
      }

      const existingUser = this.users.find(user => user.email === userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const hashedPassword = await this.hashPassword(userData.password);
      const newUser: User = {
        ...userData,
        id: uuidv4(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        ipAddress: '0.0.0.0',
        status: 'ACTIVE',
        isAdmin: userData.role === 'ADMIN',
        isSuperAdmin: false,
        isBlocked: false
      };

      this.users.push(newUser);
      this.saveUsers();
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }

  public async loginUser(email: string, password: string): Promise<User | null> {
    try {
      const user = this.users.find(u => u.email === email);
      if (!user) {
        console.log('User not found:', email);
        return null;
      }

      const isValid = await this.verifyPassword(password, user.password);
      if (!isValid) {
        console.log('Invalid password for user:', email);
        return null;
      }

      user.lastLogin = new Date().toISOString();
      this.saveUsers();

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  }

  public getAllUsers(): Omit<User, 'password'>[] {
    return this.users.map(({ password, ...user }) => user);
  }

  public getUserById(id: string): Omit<User, 'password'> | null {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<boolean> {
    try {
      const userIndex = this.users.findIndex(u => u.id === id);
      if (userIndex === -1) return false;

      if (updates.email && !this.validateEmail(updates.email)) {
        throw new Error('Invalid email format');
      }

      if (updates.email && this.users.some(u => u.email === updates.email && u.id !== id)) {
        throw new Error('Email already in use');
      }

      if (updates.role) {
        updates.isAdmin = updates.role === 'ADMIN';
      }

      if (updates.status) {
        updates.isBlocked = updates.status === 'BLOCKED';
      }

      this.users[userIndex] = {
        ...this.users[userIndex],
        ...updates
      };

      this.saveUsers();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  public deleteUser(id: string): boolean {
    try {
      const initialLength = this.users.length;
      this.users = this.users.filter(u => u.id !== id);
      
      if (this.users.length !== initialLength) {
        this.saveUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

export default UserDatabase;
