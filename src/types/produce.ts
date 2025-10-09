export type ListingStatus = 'pending' | 'active' | 'expired' | 'rejected';

export interface Produce {
  id: string;
  name: string;
  mandiRate: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  produceName: string;
  mandiRate: number;
  quantity: number;
  minOrderQty: number;
  images: string[];
  video?: string;
  status: ListingStatus;
  createdAt: Date;
  expiresAt: Date;
}

export interface Bid {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  quantity: number;
  pricePerUnit: number;
  status: 'pending' | 'accepted' | 'rejected' | 'counter';
  counterPrice?: number;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  sellerName: string;
  buyerName: string;
  produceName: string;
  quantity: number;
  totalAmount: number;
  createdAt: Date;
}
