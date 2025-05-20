
import { OrderItem } from './Product';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
  role: 'ADMIN' | 'USER';
  lastLogin: string;
  ipAddress: string;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  // Add missing properties that are used elsewhere
  isSuperAdmin?: boolean;
}
