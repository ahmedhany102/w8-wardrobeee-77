import { OrderItem } from './Product';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  isAdmin: boolean;
  isSuperAdmin: boolean; // New field for super admin
  isBlocked: boolean;
  createdAt: string;
  // Add these properties to match what's used in UserDatabase.ts
  role: 'ADMIN' | 'USER';
  lastLogin: string;
  ipAddress: string;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
}
