export interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: 'truck' | 'mini-truck' | 'pickup';
  rating: number;
  profilePic?: string;
}

export interface DeliveryTracking {
  id: string;
  transactionId?: string;
  driver: DeliveryDriver;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered';
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  currentLocation: {
    lat: number;
    lng: number;
  };
  estimatedArrival: Date;
  produceName: string;
  quantity: number;
  sellerName: string;
  buyerName: string;
  createdAt: Date;
}
