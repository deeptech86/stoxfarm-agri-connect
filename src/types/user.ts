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
  phone: string;
  role: UserRole;
  address: string;
  profile_pic?: string;
  notes?: string;
  satellite_center_id?: string;
  satellite_center_name?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
