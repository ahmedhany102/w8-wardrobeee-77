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
      console.log('Loading users from localStorage...');
      const storedUsers = localStorage.getItem('users');
      console.log('Raw stored users:', storedUsers);
      
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        console.log('Successfully loaded users:', this.users);
      } else {
        console.log('No users found in localStorage, creating default users...');
        this.createDefaultUsers();
      }
    } catch (error) {
      console.error('Error loading users:', error);
      console.log('Falling back to default users...');
      this.createDefaultUsers();
    }
  }

  private saveUsers(): void {
    try {
      console.log('Saving users to localStorage...');
      console.log('Users to save:', this.users);
      localStorage.setItem('users', JSON.stringify(this.users));
      console.log('Users saved successfully');
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
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private createDefaultUsers(): void {
    console.log('Creating default users...');
    const currentDate = new Date().toISOString();
    const defaultUsers: User[] = [
      {
        id: 'admin-1',
        name: 'Ahmed Hany',
        email: 'ahmedhanyseifeldien@gmail.com',
        password: 'Ahmedhany11*', // Will be hashed
        role: 'ADMIN',
        createdAt: currentDate,
        lastLogin: currentDate,
        ipAddress: '192.168.1.1',
        status: 'ACTIVE',
        isAdmin: true,
        isSuperAdmin: true,
        isBlocked: false
      }
    ];

    console.log('Default users before hashing:', defaultUsers);

    // Hash passwords for default users
    Promise.all(defaultUsers.map(async (user) => {
      user.password = await this.hashPassword(user.password);
      return user;
    })).then((hashedUsers) => {
      console.log('Default users after hashing:', hashedUsers);
      this.users = hashedUsers;
      this.saveUsers();
      console.log('Default users created and saved successfully');
    }).catch(error => {
      console.error('Error creating default users:', error);
    });
  }

  public async registerUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'ipAddress'>): Promise<boolean> {
    try {
      console.log('Starting user registration process...');
      console.log('Current users in database:', this.users);

      // Validate email format
      if (!this.validateEmail(userData.email)) {
        console.log('Invalid email format:', userData.email);
        throw new Error('Invalid email format');
      }

      // Validate password strength
      if (!this.validatePassword(userData.password)) {
        console.log('Invalid password format');
        throw new Error('Password does not meet security requirements');
      }

      // Check if email already exists
      const existingUser = this.users.find(user => user.email === userData.email);
      if (existingUser) {
        console.log('Email already exists:', userData.email);
        console.log('Existing user:', existingUser);
        throw new Error('Email already registered');
      }

      console.log('Creating new user...');
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

      console.log('Adding new user to database:', newUser);
      this.users.push(newUser);
      this.saveUsers();
      console.log('User registration successful');
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }

  public async loginUser(email: string, password: string): Promise<User | null> {
    try {
      const user = this.users.find(u => u.email === email);
      if (!user) return null;

      const isValid = await this.verifyPassword(password, user.password);
      if (!isValid) return null;

      // Update last login
      user.lastLogin = new Date().toISOString();
      this.saveUsers();

      // Return user without password
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

      // Validate email if it's being updated
      if (updates.email && !this.validateEmail(updates.email)) {
        throw new Error('Invalid email format');
      }

      // Check if new email is already taken by another user
      if (updates.email && this.users.some(u => u.email === updates.email && u.id !== id)) {
        throw new Error('Email already in use');
      }

      // Update isAdmin property based on role
      if (updates.role) {
        updates.isAdmin = updates.role === 'ADMIN';
      }

      // Update isBlocked property based on status
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

  public async updateUserRole(id: string, role: 'ADMIN' | 'USER'): Promise<boolean> {
    return this.updateUser(id, { role });
  }

  public async updateUserStatus(id: string, status: 'ACTIVE' | 'BLOCKED' | 'PENDING'): Promise<boolean> {
    return this.updateUser(id, { status });
  }

  public async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const userIndex = this.users.findIndex(u => u.id === id);
      if (userIndex === -1) return false;

      const user = this.users[userIndex];
      const isValid = await this.verifyPassword(currentPassword, user.password);
      if (!isValid) return false;

      if (!this.validatePassword(newPassword)) {
        throw new Error('New password does not meet security requirements');
      }

      const hashedPassword = await this.hashPassword(newPassword);
      this.users[userIndex].password = hashedPassword;
      this.saveUsers();
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
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
