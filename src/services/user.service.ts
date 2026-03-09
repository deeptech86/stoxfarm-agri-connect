/**
 * User Service
 */

import api from '@/lib/api';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'seller' | 'buyer' | 'logistics' | 'admin';
  address: string;
  profile_pic?: string;
  notes?: string;
  satellite_center_id?: string;
  satellite_center_name?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'seller' | 'buyer' | 'logistics' | 'admin';
  address: string;
  notes?: string;
  satellite_center_id?: string;
  city?: string;
  pincode?: string;
  preferred_produce?: string[];
}

export interface UpdateUserRequest {
  name?: string;
  password?: string;
  phone?: string;
  address?: string;
  profile_pic?: string;
  notes?: string;
  satellite_center_id?: string;
  is_active?: boolean;
  city?: string;
  pincode?: string;
  preferred_produce?: string[];
}

export interface PaginatedUserResponse {
  items: UserResponse[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export const userService = {
  /**
   * Get all users (admin only)
   */
  getUsers: async (
    page = 1,
    pageSize = 20,
    role?: string,
    includeInactive = false
  ): Promise<PaginatedUserResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      active_only: (!includeInactive).toString(),
    });
    if (role) params.append('role', role);

    return api.get<PaginatedUserResponse>(`/users?${params}`);
  },

  /**
   * Get a single user
   */
  getUser: async (id: string): Promise<UserResponse> => {
    return api.get<UserResponse>(`/users/${id}`);
  },

  /**
   * Search users (admin only)
   */
  searchUsers: async (
    query: string,
    role?: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedUserResponse> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (role) params.append('role', role);

    return api.get<PaginatedUserResponse>(`/users/search?${params}`);
  },

  /**
   * Get users by role (admin only)
   */
  getUsersByRole: async (
    role: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedUserResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    return api.get<PaginatedUserResponse>(`/users/role/${role}?${params}`);
  },

  /**
   * Create a new user (admin only)
   */
  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    return api.post<UserResponse>('/users', data);
  },

  /**
   * Update a user
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
    return api.put<UserResponse>(`/users/${id}`, data);
  },

  /**
   * Delete a user (admin only)
   */
  deleteUser: async (id: string, hard = false): Promise<{ message: string }> => {
    const params = hard ? '?hard_delete=true' : '';
    return api.delete<{ message: string }>(`/users/${id}${params}`);
  },

  /**
   * Activate a user (admin only)
   */
  activateUser: async (id: string): Promise<UserResponse> => {
    return api.post<UserResponse>(`/users/${id}/activate`);
  },

  /**
   * Deactivate a user (admin only)
   */
  deactivateUser: async (id: string): Promise<UserResponse> => {
    return api.post<UserResponse>(`/users/${id}/deactivate`);
  },
};

export default userService;
