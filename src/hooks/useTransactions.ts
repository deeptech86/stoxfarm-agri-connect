/**
 * React Query hooks for transactions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transaction.service';

// Query keys
export const transactionKeys = {
  all: ['transactions'] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
  byNumber: (num: string) => [...transactionKeys.all, 'number', num] as const,
  user: (role: 'seller' | 'buyer', page?: number, status?: string) =>
    [...transactionKeys.all, 'user', role, page, status] as const,
  admin: (page?: number, status?: string, sellerPaid?: boolean) =>
    [...transactionKeys.all, 'admin', page, status, sellerPaid] as const,
  pendingPayouts: (page?: number) => [...transactionKeys.all, 'pending-payouts', page] as const,
};

// Hooks
export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getTransaction(id),
    enabled: !!id,
  });
};

export const useTransactionByNumber = (transactionNumber: string) => {
  return useQuery({
    queryKey: transactionKeys.byNumber(transactionNumber),
    queryFn: () => transactionService.getByNumber(transactionNumber),
    enabled: !!transactionNumber,
  });
};

export const useUserTransactions = (
  role: 'seller' | 'buyer',
  page = 1,
  pageSize = 20,
  paymentStatus?: string
) => {
  return useQuery({
    queryKey: transactionKeys.user(role, page, paymentStatus),
    queryFn: () => transactionService.getUserTransactions(role, page, pageSize, paymentStatus),
  });
};

export const useAllTransactions = (
  page = 1,
  pageSize = 20,
  paymentStatus?: string,
  sellerPaid?: boolean
) => {
  return useQuery({
    queryKey: transactionKeys.admin(page, paymentStatus, sellerPaid),
    queryFn: () => transactionService.getAllTransactions(page, pageSize, paymentStatus, sellerPaid),
  });
};

export const usePendingPayouts = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: transactionKeys.pendingPayouts(page),
    queryFn: () => transactionService.getPendingPayouts(page, pageSize),
  });
};

// Mutations
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => transactionService.createFromBid(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      status,
      paymentMethod,
      paymentReference,
    }: {
      transactionId: string;
      status: string;
      paymentMethod?: string;
      paymentReference?: string;
    }) => transactionService.updatePaymentStatus(transactionId, status, paymentMethod, paymentReference),
    onSuccess: (_, { transactionId }) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
};

export const useMarkSellerPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, paymentReference }: { transactionId: string; paymentReference?: string }) =>
      transactionService.markSellerPaid(transactionId, paymentReference),
    onSuccess: (_, { transactionId }) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
};
