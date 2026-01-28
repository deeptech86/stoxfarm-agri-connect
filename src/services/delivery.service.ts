/**
 * Delivery Service
 */

import api from '@/lib/api';

export interface DeliveryDriverResponse {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_number: string;
  vehicle_type: 'bike' | 'auto' | 'mini_truck' | 'truck' | 'large_truck';
  license_number?: string;
  profile_pic?: string;
  is_available: boolean;
  is_active: boolean;
  rating: number;
  total_deliveries: number;
  created_at: string;
}

export interface StatusHistoryEntry {
  status: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  updated_by: string;
  updated_at: string;
}

export interface DeliveryResponse {
  id: string;
  tracking_number: string;
  transaction_id: string;
  logistics_user_id: string;
  driver_id?: string;
  driver?: DeliveryDriverResponse;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  origin_address: string;
  origin_lat?: number;
  origin_lng?: number;
  dest_address: string;
  dest_lat?: number;
  dest_lng?: number;
  current_lat?: number;
  current_lng?: number;
  produce_name: string;
  quantity: number;
  seller_name: string;
  buyer_name: string;
  special_instructions?: string;
  estimated_pickup?: string;
  estimated_arrival?: string;
  actual_pickup?: string;
  actual_delivery?: string;
  status_history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface CreateDeliveryRequest {
  transaction_id: string;
  origin_address: string;
  origin_lat?: number;
  origin_lng?: number;
  dest_address: string;
  dest_lat?: number;
  dest_lng?: number;
  produce_name: string;
  quantity: number;
  seller_name: string;
  buyer_name: string;
  special_instructions?: string;
  estimated_pickup?: string;
  estimated_arrival?: string;
}

export interface UpdateDeliveryRequest {
  driver_id?: string;
  special_instructions?: string;
  estimated_pickup?: string;
  estimated_arrival?: string;
}

export interface UpdateStatusRequest {
  status: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateDriverRequest {
  name: string;
  phone: string;
  email?: string;
  vehicle_number: string;
  vehicle_type: string;
  license_number?: string;
  profile_pic?: string;
}

export interface PaginatedDeliveryResponse {
  items: DeliveryResponse[];
  total: number;
  page: number;
  page_size: number;
}

export const deliveryService = {
  /**
   * Create a new delivery
   */
  createDelivery: async (data: CreateDeliveryRequest): Promise<DeliveryResponse> => {
    return api.post<DeliveryResponse>('/deliveries', data);
  },

  /**
   * Get a delivery by ID
   */
  getDelivery: async (id: string): Promise<DeliveryResponse> => {
    return api.get<DeliveryResponse>(`/deliveries/${id}`);
  },

  /**
   * Get delivery by tracking number
   */
  getByTrackingNumber: async (trackingNumber: string): Promise<DeliveryResponse> => {
    return api.get<DeliveryResponse>(`/deliveries/tracking/${trackingNumber}`);
  },

  /**
   * Get logistics user's deliveries
   */
  getLogisticsDeliveries: async (
    page = 1,
    pageSize = 20,
    status?: string
  ): Promise<PaginatedDeliveryResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (status) params.append('status', status);

      return await api.get<PaginatedDeliveryResponse>(`/deliveries/logistics/me?${params}`);
    } catch {
      return { items: [], total: 0, page: 1, page_size: pageSize };
    }
  },

  /**
   * Get driver's deliveries
   */
  getDriverDeliveries: async (
    driverId: string,
    page = 1,
    pageSize = 20,
    status?: string
  ): Promise<PaginatedDeliveryResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (status) params.append('status', status);

    return api.get<PaginatedDeliveryResponse>(`/deliveries/driver/${driverId}?${params}`);
  },

  /**
   * Get all active deliveries (admin/logistics)
   */
  getActiveDeliveries: async (
    page = 1,
    pageSize = 50
  ): Promise<PaginatedDeliveryResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      return await api.get<PaginatedDeliveryResponse>(`/deliveries/active?${params}`);
    } catch {
      return { items: [], total: 0, page: 1, page_size: pageSize };
    }
  },

  /**
   * Update delivery
   */
  updateDelivery: async (id: string, data: UpdateDeliveryRequest): Promise<DeliveryResponse> => {
    return api.put<DeliveryResponse>(`/deliveries/${id}`, data);
  },

  /**
   * Update delivery status
   */
  updateStatus: async (id: string, data: UpdateStatusRequest): Promise<DeliveryResponse> => {
    return api.put<DeliveryResponse>(`/deliveries/${id}/status`, data);
  },

  /**
   * Update delivery location (driver only)
   */
  updateLocation: async (
    id: string,
    latitude: number,
    longitude: number
  ): Promise<DeliveryResponse> => {
    return api.put<DeliveryResponse>(`/deliveries/${id}/location`, { latitude, longitude });
  },

  /**
   * Assign driver to delivery
   */
  assignDriver: async (deliveryId: string, driverId: string): Promise<DeliveryResponse> => {
    return api.post<DeliveryResponse>(`/deliveries/${deliveryId}/assign/${driverId}`, {});
  },

  // Driver operations

  /**
   * Create a new driver
   */
  createDriver: async (data: CreateDriverRequest): Promise<DeliveryDriverResponse> => {
    return api.post<DeliveryDriverResponse>('/deliveries/drivers', data);
  },

  /**
   * Get a driver by ID
   */
  getDriver: async (id: string): Promise<DeliveryDriverResponse> => {
    return api.get<DeliveryDriverResponse>(`/deliveries/drivers/${id}`);
  },

  /**
   * Get available drivers
   */
  getAvailableDrivers: async (
    vehicleType?: string,
    limit = 20
  ): Promise<DeliveryDriverResponse[]> => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      if (vehicleType) params.append('vehicle_type', vehicleType);

      return await api.get<DeliveryDriverResponse[]>(`/deliveries/drivers/available?${params}`);
    } catch {
      return [];
    }
  },

  /**
   * Update driver availability
   */
  updateDriverAvailability: async (
    driverId: string,
    isAvailable: boolean
  ): Promise<DeliveryDriverResponse> => {
    return api.put<DeliveryDriverResponse>(`/deliveries/drivers/${driverId}/availability?is_available=${isAvailable}`, {});
  },
};

export default deliveryService;
