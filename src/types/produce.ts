export type ListingStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'sold_out';
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'counter' | 'withdrawn';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Produce {
  id: string;
  name: string;
  category: string;
  mandi_rate: number;
  unit: string;
  is_active: boolean;
}

export interface ListingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Listing {
  id: string;
  seller_id: string;
  seller_name?: string;
  satellite_center_id?: string;
  satellite_center_name?: string;
  produce_id: string;
  produce_name: string;
  mandi_rate: number;
  item_rate: number;
  quantity: number;
  available_quantity: number;
  min_order_qty: number;
  description?: string;
  images: ListingImage[];
  video_url?: string;
  status: ListingStatus;
  view_count: number;
  created_at: string;
  expires_at: string;
}

export interface Bid {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer_name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  status: BidStatus;
  counter_price?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_number: string;
  bid_id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  seller_name: string;
  buyer_name: string;
  produce_name: string;
  quantity: number;
  price_per_unit: number;
  base_amount: number;
  buyer_gst_amount: number;
  buyer_platform_fee: number;
  buyer_total_amount: number;
  seller_gst_amount: number;
  seller_platform_fee: number;
  seller_payout_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_reference?: string;
  seller_paid: boolean;
  seller_paid_at?: string;
  seller_payout_reference?: string;
  created_at: string;
  updated_at: string;
}
