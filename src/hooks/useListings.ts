/**
 * React Query hooks for listings and bids
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService, CreateListingRequest, CreateBidRequest, CounterBidRequest } from '@/services/listing.service';

// Query keys
export const listingKeys = {
  all: ['listings'] as const,
  active: () => [...listingKeys.all, 'active'] as const,
  adminAll: (page?: number, status?: string, produceName?: string) => [...listingKeys.all, 'admin-all', page, status, produceName] as const,
  detail: (id: string) => [...listingKeys.all, 'detail', id] as const,
  seller: (page?: number, status?: string) => [...listingKeys.all, 'seller', page, status] as const,
  bids: (listingId: string) => [...listingKeys.all, 'bids', listingId] as const,
  sellerBids: (status?: string) => [...listingKeys.all, 'seller-bids', status] as const,
  buyerBids: (status?: string) => [...listingKeys.all, 'buyer-bids', status] as const,
  produce: () => [...listingKeys.all, 'produce'] as const,
};

// Hooks
export const useActiveListings = (page = 1, pageSize = 20, produceName?: string) => {
  return useQuery({
    queryKey: [...listingKeys.active(), page, pageSize, produceName],
    queryFn: () => listingService.getActiveListings(page, pageSize, produceName),
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => listingService.getListing(id),
    enabled: !!id,
  });
};

export const useSellerListings = (page = 1, pageSize = 20, status?: string) => {
  return useQuery({
    queryKey: listingKeys.seller(page, status),
    queryFn: () => listingService.getSellerListings(page, pageSize, status),
  });
};

export const useListingBids = (listingId: string) => {
  return useQuery({
    queryKey: listingKeys.bids(listingId),
    queryFn: () => listingService.getListingBids(listingId),
    enabled: !!listingId,
  });
};

export const useSellerBids = (page = 1, pageSize = 20, status?: string) => {
  return useQuery({
    queryKey: listingKeys.sellerBids(status),
    queryFn: () => listingService.getSellerBids(page, pageSize, status),
  });
};

export const useBuyerBids = (page = 1, pageSize = 20, status?: string) => {
  return useQuery({
    queryKey: listingKeys.buyerBids(status),
    queryFn: () => listingService.getBuyerBids(page, pageSize, status),
  });
};

export const useProduceList = () => {
  return useQuery({
    queryKey: listingKeys.produce(),
    queryFn: () => listingService.getProduceList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Admin hooks
export const useAdminAllListings = (page = 1, pageSize = 20, status?: string, produceName?: string) => {
  return useQuery({
    queryKey: listingKeys.adminAll(page, status, produceName),
    queryFn: () => listingService.getAllListings(page, pageSize, status, produceName),
  });
};

// Mutations
export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListingRequest) => listingService.createListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};

export const useAdminCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sellerId, data }: { sellerId: string; data: CreateListingRequest }) =>
      listingService.adminCreateListing(sellerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateListingRequest> }) =>
      listingService.updateListing(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingService.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};

export const useCreateBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBidRequest) => listingService.createBid(data),
    onSuccess: (_, { listing_id }) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.bids(listing_id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.buyerBids() });
    },
  });
};

export const useAcceptBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => listingService.acceptBid(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};

export const useRejectBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bidId, reason }: { bidId: string; reason?: string }) =>
      listingService.rejectBid(bidId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};

export const useCounterBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bidId, data }: { bidId: string; data: CounterBidRequest }) =>
      listingService.counterBid(bidId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};

export const useWithdrawBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => listingService.withdrawBid(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};

export const useAcceptCounter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bidId: string) => listingService.acceptCounter(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};
