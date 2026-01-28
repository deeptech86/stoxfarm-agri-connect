/**
 * Produce Service
 */

import api from '@/lib/api';

export interface ProduceResponse {
  id: string;
  name: string;
  category?: string;
  unit: string;
  mandi_rate: string;
  mandi_rate_updated_at: string;
  satellite_center_id?: string;
  satellite_center_name?: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProduceRequest {
  name: string;
  category?: string;
  unit?: string;
  mandi_rate?: string;
  satellite_center_id?: string;
  description?: string;
  image_url?: string;
}

export interface UpdateProduceRequest {
  name?: string;
  category?: string;
  unit?: string;
  mandi_rate?: string;
  satellite_center_id?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface PaginatedProduceResponse {
  items: ProduceResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const produceService = {
  /**
   * Get all produce
   */
  getProduce: async (
    page = 1,
    pageSize = 20,
    category?: string,
    activeOnly = true
  ): Promise<PaginatedProduceResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      active_only: activeOnly.toString(),
    });
    if (category) params.append('category', category);

    return api.get<PaginatedProduceResponse>(`/produce?${params}`);
  },

  /**
   * Get a single produce item
   */
  getProduceById: async (id: string): Promise<ProduceResponse> => {
    return api.get<ProduceResponse>(`/produce/${id}`);
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<string[]> => {
    return api.get<string[]>('/produce/categories');
  },

  /**
   * Search produce
   */
  searchProduce: async (
    query: string,
    limit = 20
  ): Promise<ProduceResponse[]> => {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    return api.get<ProduceResponse[]>(`/produce/search?${params}`);
  },

  /**
   * Create a new produce item (admin only)
   */
  createProduce: async (data: CreateProduceRequest): Promise<ProduceResponse> => {
    return api.post<ProduceResponse>('/produce', data);
  },

  /**
   * Update a produce item (admin only)
   */
  updateProduce: async (id: string, data: UpdateProduceRequest): Promise<ProduceResponse> => {
    return api.put<ProduceResponse>(`/produce/${id}`, data);
  },

  /**
   * Delete a produce item (admin only)
   */
  deleteProduce: async (id: string, hard = false): Promise<{ message: string }> => {
    const params = hard ? '?hard_delete=true' : '';
    return api.delete<{ message: string }>(`/produce/${id}${params}`);
  },

  /**
   * Activate a produce item (admin only)
   */
  activateProduce: async (id: string): Promise<ProduceResponse> => {
    return api.post<ProduceResponse>(`/produce/${id}/activate`);
  },

  /**
   * Deactivate a produce item (admin only)
   */
  deactivateProduce: async (id: string): Promise<ProduceResponse> => {
    return api.post<ProduceResponse>(`/produce/${id}/deactivate`);
  },
};

export default produceService;
