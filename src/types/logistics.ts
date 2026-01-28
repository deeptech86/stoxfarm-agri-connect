export interface DeliveryDriver {
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

export interface DeliveryTracking {
  id: string;
  tracking_number: string;
  transaction_id: string;
  logistics_user_id: string;
  driver_id?: string;
  driver?: DeliveryDriver;
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
  pickup_phone?: string;
  delivery_phone?: string;
  special_instructions?: string;
  estimated_pickup?: string;
  estimated_arrival?: string;
  actual_pickup?: string;
  actual_delivery?: string;
  status_history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}
