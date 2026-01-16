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

export type PaymentStatus = 'pending' | 'completed';

export interface Transaction {
  id: string;
  sellerId: string;
  buyerId: string;
  sellerName: string;
  buyerName: string;
  produceName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;           // Base amount (quantity * pricePerUnit)
  buyerPaidAmount: number;       // Amount buyer pays (incl. GST + Platform Fee)
  sellerPayoutAmount: number;    // Amount seller receives (minus GST + Platform Fee)
  paymentStatus: PaymentStatus;  // Buyer payment status
  sellerPaid: boolean;           // Whether admin has paid the seller
  createdAt: Date;
}
