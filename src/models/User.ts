
export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string; // hashed and optional
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
  role: 'ADMIN' | 'USER';
  lastLogin: string;
  ipAddress: string;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  isSuperAdmin: boolean;
}

// Add a type guard function to validate user role
export function isValidRole(role: string): role is 'ADMIN' | 'USER' {
  return role === 'ADMIN' || role === 'USER';
}

// Add a type guard function to validate user status
export function isValidStatus(status: string): status is 'ACTIVE' | 'BLOCKED' | 'PENDING' {
  return status === 'ACTIVE' || status === 'BLOCKED' || status === 'PENDING';
}
