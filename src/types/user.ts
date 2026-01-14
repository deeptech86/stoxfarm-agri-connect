export type UserRole = 'seller' | 'buyer' | 'logistics' | 'admin';

export interface CropDetail {
  cropName: string;
  gst: number;
  overallQuantity: number;
  minQuantity: number;
}

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
  cropsSupported?: string[]; // Legacy - kept for compatibility
  cropDetails?: CropDetail[]; // Detailed crop info for sellers
  satelliteCenterName?: string; // For seller, buyer, logistics
  satelliteCenterId?: string; // For seller, buyer, logistics
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
