export type UserRole = 'seller' | 'buyer' | 'logistics' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  address: string;
  profilePic?: string;
  notes?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
