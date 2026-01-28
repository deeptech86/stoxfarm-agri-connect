/**
 * Satellite Center Service
 */

import api from '@/lib/api';

export interface SatelliteCenterResponse {
  id: string;
  name: string;
  address: string;
  office_phone: string;
  platform_fee: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSatelliteCenterRequest {
  name: string;
  address: string;
  office_phone: string;
  platform_fee?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
}

export interface UpdateSatelliteCenterRequest {
  name?: string;
  address?: string;
  office_phone?: string;
  platform_fee?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
  is_active?: boolean;
}

export interface PaginatedSatelliteCenterResponse {
  items: SatelliteCenterResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const satelliteCenterService = {
  /**
   * Get all satellite centers
   */
  getSatelliteCenters: async (
    page = 1,
    pageSize = 20,
    city?: string,
    state?: string,
    activeOnly = true
  ): Promise<PaginatedSatelliteCenterResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      active_only: activeOnly.toString(),
    });
    if (city) params.append('city', city);
    if (state) params.append('state', state);

    return api.get<PaginatedSatelliteCenterResponse>(`/satellite-centers?${params}`);
  },

  /**
   * Get a single satellite center
   */
  getSatelliteCenter: async (id: string): Promise<SatelliteCenterResponse> => {
    return api.get<SatelliteCenterResponse>(`/satellite-centers/${id}`);
  },

  /**
   * Search satellite centers
   */
  searchSatelliteCenters: async (
    query: string,
    limit = 20
  ): Promise<SatelliteCenterResponse[]> => {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    return api.get<SatelliteCenterResponse[]>(`/satellite-centers/search?${params}`);
  },

  /**
   * Create a new satellite center (admin only)
   */
  createSatelliteCenter: async (data: CreateSatelliteCenterRequest): Promise<SatelliteCenterResponse> => {
    return api.post<SatelliteCenterResponse>('/satellite-centers', data);
  },

  /**
   * Update a satellite center (admin only)
   */
  updateSatelliteCenter: async (id: string, data: UpdateSatelliteCenterRequest): Promise<SatelliteCenterResponse> => {
    return api.put<SatelliteCenterResponse>(`/satellite-centers/${id}`, data);
  },

  /**
   * Delete a satellite center (admin only)
   */
  deleteSatelliteCenter: async (id: string, hard = false): Promise<{ message: string }> => {
    const params = hard ? '?hard_delete=true' : '';
    return api.delete<{ message: string }>(`/satellite-centers/${id}${params}`);
  },

  /**
   * Activate a satellite center (admin only)
   */
  activateSatelliteCenter: async (id: string): Promise<SatelliteCenterResponse> => {
    return api.post<SatelliteCenterResponse>(`/satellite-centers/${id}/activate`);
  },

  /**
   * Deactivate a satellite center (admin only)
   */
  deactivateSatelliteCenter: async (id: string): Promise<SatelliteCenterResponse> => {
    return api.post<SatelliteCenterResponse>(`/satellite-centers/${id}/deactivate`);
  },
};

export default satelliteCenterService;
