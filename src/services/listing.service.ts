/**
 * Listing and Bid Service
 */

import api from '@/lib/api';

export interface ProduceResponse {
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

export interface ListingResponse {
  id: string;
  seller_id: string;
  seller_name?: string;
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
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'sold_out';
  view_count: number;
  created_at: string;
  expires_at: string;
}

export interface CreateListingRequest {
  produce_id: string;
  produce_name: string;
  mandi_rate: number;
  item_rate: number;
  quantity: number;
  min_order_qty: number;
  description?: string;
  video_url?: string;
}

export interface UpdateListingRequest {
  quantity?: number;
  min_order_qty?: number;
  item_rate?: number;
  description?: string;
  video_url?: string;
}

export interface BidResponse {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer_name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'counter' | 'withdrawn';
  counter_price?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBidRequest {
  listing_id: string;
  quantity: number;
  price_per_unit: number;
  notes?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface CounterBidRequest {
  counter_price: number;
}

// Helper to parse bid response (convert string numbers to actual numbers)
const parseBidResponse = (bid: Record<string, unknown>): BidResponse => ({
  ...bid,
  quantity: Number(bid.quantity),
  price_per_unit: Number(bid.price_per_unit),
  total_amount: Number(bid.total_amount),
  counter_price: bid.counter_price ? Number(bid.counter_price) : undefined,
} as BidResponse);

export const listingService = {
  /**
   * Get all active listings
   */
  getActiveListings: async (
    page = 1,
    pageSize = 20,
    produceName?: string,
    minQuantity?: number
  ): Promise<PaginatedResponse<ListingResponse>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (produceName) params.append('produce_name', produceName);
      if (minQuantity) params.append('min_quantity', minQuantity.toString());

      return await api.get<PaginatedResponse<ListingResponse>>(`/listings?${params}`);
    } catch {
      return { items: [], total: 0, page: 1, page_size: pageSize, pages: 0 };
    }
  },

  /**
   * Get a single listing
   */
  getListing: async (id: string): Promise<ListingResponse> => {
    return api.get<ListingResponse>(`/listings/${id}`);
  },

  /**
   * Get seller's listings
   */
  getSellerListings: async (
    page = 1,
    pageSize = 20,
    status?: string
  ): Promise<PaginatedResponse<ListingResponse>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (status) params.append('status', status);

      return await api.get<PaginatedResponse<ListingResponse>>(`/listings/my?${params}`);
    } catch {
      return { items: [], total: 0, page: 1, page_size: pageSize, pages: 0 };
    }
  },

  /**
   * Get all listings (admin only)
   */
  getAllListings: async (
    page = 1,
    pageSize = 20,
    status?: string,
    produceName?: string
  ): Promise<PaginatedResponse<ListingResponse>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (status) params.append('status', status);
      if (produceName) params.append('produce_name', produceName);

      return await api.get<PaginatedResponse<ListingResponse>>(`/listings/all?${params}`);
    } catch {
      return { items: [], total: 0, page: 1, page_size: pageSize, pages: 0 };
    }
  },

  /**
   * Admin create listing for a seller
   */
  adminCreateListing: async (sellerId: string, data: CreateListingRequest): Promise<ListingResponse> => {
    return api.post<ListingResponse>(`/listings/admin?seller_id=${sellerId}`, data);
  },

  /**
   * Create a new listing
   */
  createListing: async (data: CreateListingRequest): Promise<ListingResponse> => {
    return api.post<ListingResponse>('/listings', data);
  },

  /**
   * Update a listing
   */
  updateListing: async (id: string, data: UpdateListingRequest): Promise<ListingResponse> => {
    return api.put<ListingResponse>(`/listings/${id}`, data);
  },

  /**
   * Delete a listing
   */
  deleteListing: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/listings/${id}`);
  },

  /**
   * Get produce list
   */
  getProduceList: async (): Promise<ProduceResponse[]> => {
    try {
      const response = await api.get<{ items: ProduceResponse[] }>('/produce?page=1&page_size=100&active_only=true');
      return response.items || [];
    } catch {
      return [];
    }
  },

  // Bid operations

  /**
   * Get bids for a listing (seller only)
   */
  getListingBids: async (listingId: string): Promise<BidResponse[]> => {
    return api.get<BidResponse[]>(`/listings/${listingId}/bids`);
  },

  /**
   * Get seller's bids (all bids on seller's listings)
   */
  getSellerBids: async (
    page = 1,
    pageSize = 20,
    status?: string
  ): Promise<PaginatedResponse<BidResponse>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (status) params.append('status', status);

      const response = await api.get<PaginatedResponse<Record<string, unknown>>>(`/bids/seller/me?${params}`);
      return {
        ...response,
        items: response.items.map(parseBidResponse),
      };
    } catch {
      return { items: [], total: 0, page: 1, page_size: pageSize, pages: 0 };
    }
  },

  /**
   * Create a bid on a listing
   */
  createBid: async (data: CreateBidRequest): Promise<BidResponse> => {
    const response = await api.post<Record<string, unknown>>('/bids', data);
    return parseBidResponse(response);
  },

  /**
   * Get buyer's bids
   */
  getBuyerBids: async (
    page = 1,
    pageSize = 20,
    status?: string
  ): Promise<PaginatedResponse<BidResponse>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (status) params.append('status', status);

      const response = await api.get<PaginatedResponse<Record<string, unknown>>>(`/bids/buyer/me?${params}`);
      return {
        ...response,
        items: response.items.map(parseBidResponse),
      };
    } catch {
      return { items: [], total: 0, page: 1, page_size: pageSize, pages: 0 };
    }
  },

  /**
   * Accept a bid (seller only)
   */
  acceptBid: async (bidId: string): Promise<BidResponse> => {
    const response = await api.post<Record<string, unknown>>(`/bids/${bidId}/accept`);
    return parseBidResponse(response);
  },

  /**
   * Reject a bid (seller only)
   */
  rejectBid: async (bidId: string, reason?: string): Promise<BidResponse> => {
    const response = await api.post<Record<string, unknown>>(`/bids/${bidId}/reject`, reason ? { reason } : undefined);
    return parseBidResponse(response);
  },

  /**
   * Counter a bid (seller only)
   */
  counterBid: async (bidId: string, data: CounterBidRequest): Promise<BidResponse> => {
    const response = await api.post<Record<string, unknown>>(`/bids/${bidId}/counter`, data);
    return parseBidResponse(response);
  },

  /**
   * Withdraw a bid (buyer only)
   */
  withdrawBid: async (bidId: string): Promise<BidResponse> => {
    const response = await api.post<Record<string, unknown>>(`/bids/${bidId}/withdraw`);
    return parseBidResponse(response);
  },

  /**
   * Accept counter offer (buyer only)
   */
  acceptCounter: async (bidId: string): Promise<BidResponse> => {
    const response = await api.post<Record<string, unknown>>(`/bids/${bidId}/accept-counter`);
    return parseBidResponse(response);
  },
};

export default listingService;
