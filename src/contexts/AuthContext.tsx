import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/types/user';
import { authService, UserResponse } from '@/services/auth.service';
import { getStoredTokens, clearStoredTokens, ApiError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert API response to User type
const mapUserResponse = (response: UserResponse): User => ({
  id: response.id,
  name: response.name,
  email: response.email,
  phone: response.phone,
  role: response.role as User['role'],
  address: response.address,
  profile_pic: response.profile_pic,
  notes: response.notes,
  satellite_center_id: response.satellite_center_id,
  satellite_center_name: response.satellite_center_name,
  is_active: response.is_active,
  created_at: response.created_at,
  last_login: response.last_login,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      const tokens = getStoredTokens();
      if (tokens?.access_token) {
        try {
          const userResponse = await authService.getMe();
          setUser(mapUserResponse(userResponse));
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Only clear tokens for authentication errors (401), not for network errors
          if (error instanceof ApiError && error.status === 401) {
            clearStoredTokens();
          }
          // For other errors (network issues, server down), keep the tokens
          // User can retry or will be prompted to login on next API call
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Login to get tokens
      await authService.login({ email, password });
      // Fetch full user profile after successful login
      const userResponse = await authService.getMe();
      setUser(mapUserResponse(userResponse));
      return true;
    } catch (error: unknown) {
      console.error('Login failed:', error);
      // Re-throw with a user-friendly message
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(String(error.message));
      }
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const userResponse = await authService.getMe();
      setUser(mapUserResponse(userResponse));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      updateProfile,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
