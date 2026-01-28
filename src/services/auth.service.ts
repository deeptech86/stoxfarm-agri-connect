/**
 * Authentication Service
 */

import api, { setStoredTokens, clearStoredTokens, getStoredTokens } from '@/lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'seller' | 'buyer' | 'logistics';
  address: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  address: string;
  profile_pic?: string;
  notes?: string;
  satellite_center_id?: string;
  satellite_center_name?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface TokensResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserBasicInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  profile_pic?: string;
}

export interface LoginResponse {
  user: UserBasicInfo;
  tokens: TokensResponse;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export const authService = {
  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    setStoredTokens({
      access_token: response.tokens.access_token,
      refresh_token: response.tokens.refresh_token,
      token_type: response.tokens.token_type,
    });
    return response;
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<UserResponse> => {
    return api.post<UserResponse>('/auth/register', data);
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearStoredTokens();
    }
  },

  /**
   * Logout from all devices
   */
  logoutAll: async (): Promise<void> => {
    try {
      await api.post('/auth/logout-all');
    } finally {
      clearStoredTokens();
    }
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<UserResponse> => {
    return api.get<UserResponse>('/auth/me');
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<TokensResponse> => {
    const tokens = getStoredTokens();
    if (!tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<TokensResponse>('/auth/refresh', {
      refresh_token: tokens.refresh_token,
    });

    setStoredTokens({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      token_type: response.token_type,
    });

    return response;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/auth/change-password', data);
  },

  /**
   * Get active devices
   */
  getDevices: async () => {
    return api.get<{ devices: unknown[] }>('/auth/devices');
  },

  /**
   * Revoke a device
   */
  revokeDevice: async (tokenId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/auth/devices/${tokenId}`);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const tokens = getStoredTokens();
    return !!tokens?.access_token;
  },
};

export default authService;
