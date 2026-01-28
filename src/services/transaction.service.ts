/**
 * Transaction Service
 */

import api from '@/lib/api';

export interface TransactionResponse {
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
  buyer_gst_percentage: number;
  buyer_gst_amount: number;
  buyer_platform_fee_pct: number;
  buyer_platform_fee: number;
  buyer_total_amount: number;
  seller_gst_percentage: number;
  seller_gst_deduction: number;
  seller_platform_fee_pct: number;
  seller_platform_fee: number;
  seller_payout_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  seller_paid: boolean;
  seller_paid_at?: string;
  seller_payment_ref?: string;
  created_at: string;
  updated_at: string;
}

// Helper to parse transaction response from backend (convert string decimals to numbers)
const parseTransactionResponse = (txn: Record<string, unknown>): TransactionResponse => ({
  id: txn.id as string,
  transaction_number: txn.transaction_number as string,
  bid_id: txn.bid_id as string,
  listing_id: txn.listing_id as string,
  seller_id: txn.seller_id as string,
  buyer_id: txn.buyer_id as string,
  seller_name: txn.seller_name as string,
  buyer_name: txn.buyer_name as string,
  produce_name: txn.produce_name as string,
  quantity: Number(txn.quantity),
  price_per_unit: Number(txn.price_per_unit),
  base_amount: Number(txn.base_amount),
  buyer_gst_percentage: Number(txn.buyer_gst_percentage),
  buyer_gst_amount: Number(txn.buyer_gst_amount),
  buyer_platform_fee_pct: Number(txn.buyer_platform_fee_pct),
  buyer_platform_fee: Number(txn.buyer_platform_fee_amt),
  buyer_total_amount: Number(txn.buyer_total_amount),
  seller_gst_percentage: Number(txn.seller_gst_percentage),
  seller_gst_deduction: Number(txn.seller_gst_deduction),
  seller_platform_fee_pct: Number(txn.seller_platform_fee_pct),
  seller_platform_fee: Number(txn.seller_platform_fee_ded),
  seller_payout_amount: Number(txn.seller_payout_amount),
  payment_status: txn.payment_status as TransactionResponse['payment_status'],
  payment_method: txn.payment_method as string | undefined,
  payment_reference: txn.payment_reference as string | undefined,
  paid_at: txn.paid_at as string | undefined,
  seller_paid: txn.seller_paid as boolean,
  seller_paid_at: txn.seller_paid_at as string | undefined,
  seller_payment_ref: txn.seller_payment_ref as string | undefined,
  created_at: txn.created_at as string,
  updated_at: txn.updated_at as string,
});

export interface PaginatedTransactionResponse {
  items: TransactionResponse[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export const transactionService = {
  /**
   * Create transaction from accepted bid
   */
  createFromBid: async (bidId: string): Promise<TransactionResponse> => {
    const response = await api.post<Record<string, unknown>>('/transactions', { bid_id: bidId });
    return parseTransactionResponse(response);
  },

  /**
   * Get a single transaction
   */
  getTransaction: async (id: string): Promise<TransactionResponse> => {
    const response = await api.get<Record<string, unknown>>(`/transactions/${id}`);
    return parseTransactionResponse(response);
  },

  /**
   * Get transaction by number
   */
  getByNumber: async (transactionNumber: string): Promise<TransactionResponse> => {
    const response = await api.get<Record<string, unknown>>(`/transactions/number/${transactionNumber}`);
    return parseTransactionResponse(response);
  },

  /**
   * Get user transactions (as seller or buyer)
   */
  getUserTransactions: async (
    role: 'seller' | 'buyer',
    page = 1,
    pageSize = 20,
    paymentStatus?: string
  ): Promise<PaginatedTransactionResponse> => {
    try {
      const params = new URLSearchParams({
        role,
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (paymentStatus) params.append('payment_status', paymentStatus);

      const response = await api.get<{ items: Record<string, unknown>[]; total: number; page: number; page_size: number; pages: number }>(`/transactions/me?${params}`);
      return {
        ...response,
        items: response.items.map(parseTransactionResponse),
      };
    } catch {
      return { items: [], total: 0, page: 1, page_size: pageSize, pages: 0 };
    }
  },

  /**
   * Get all transactions (admin only)
   */
  getAllTransactions: async (
    page = 1,
    pageSize = 20,
    paymentStatus?: string,
    sellerPaid?: boolean
  ): Promise<PaginatedTransactionResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (paymentStatus) params.append('payment_status', paymentStatus);
      if (sellerPaid !== undefined) params.append('seller_paid', sellerPaid.toString());

      const response = await api.get<{ items: Record<string, unknown>[]; total: number; page: number; page_size: number; pages: number }>(`/transactions/admin/all?${params}`);
      return {
        ...response,
        items: response.items.map(parseTransactionResponse),
      };
    } catch {
      return { items: [], total: 0, page: 1, page_size: pageSize, pages: 0 };
    }
  },

  /**
   * Update payment status (buyer pays)
   */
  updatePaymentStatus: async (
    transactionId: string,
    status: string,
    paymentMethod?: string,
    paymentReference?: string
  ): Promise<TransactionResponse> => {
    const response = await api.put<Record<string, unknown>>(`/transactions/${transactionId}/payment`, {
      status,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
    });
    return parseTransactionResponse(response);
  },

  /**
   * Mark seller as paid (admin only)
   */
  markSellerPaid: async (
    transactionId: string,
    paymentReference?: string
  ): Promise<TransactionResponse> => {
    const response = await api.post<Record<string, unknown>>(`/transactions/${transactionId}/seller-payout`, {
      payment_reference: paymentReference,
    });
    return parseTransactionResponse(response);
  },

  /**
   * Get pending seller payouts (admin only)
   */
  getPendingPayouts: async (
    page = 1,
    pageSize = 20
  ): Promise<PaginatedTransactionResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    const response = await api.get<{ items: Record<string, unknown>[]; total: number; page: number; page_size: number; pages: number }>(`/transactions/admin/pending-payouts?${params}`);
    return {
      ...response,
      items: response.items.map(parseTransactionResponse),
    };
  },
};

export default transactionService;
