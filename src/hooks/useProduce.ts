/**
 * React Query hooks for produce management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  produceService,
  CreateProduceRequest,
  UpdateProduceRequest,
} from '@/services/produce.service';

// Query keys
export const produceKeys = {
  all: ['produce'] as const,
  list: (page?: number, category?: string, activeOnly?: boolean) =>
    [...produceKeys.all, 'list', page, category, activeOnly] as const,
  detail: (id: string) => [...produceKeys.all, 'detail', id] as const,
  search: (query: string) => [...produceKeys.all, 'search', query] as const,
  categories: () => [...produceKeys.all, 'categories'] as const,
};

// Hooks
export const useProduce = (
  page = 1,
  pageSize = 20,
  category?: string,
  activeOnly = false
) => {
  return useQuery({
    queryKey: produceKeys.list(page, category, activeOnly),
    queryFn: () => produceService.getProduce(page, pageSize, category, activeOnly),
  });
};

export const useProduceById = (id: string) => {
  return useQuery({
    queryKey: produceKeys.detail(id),
    queryFn: () => produceService.getProduceById(id),
    enabled: !!id,
  });
};

export const useProduceCategories = () => {
  return useQuery({
    queryKey: produceKeys.categories(),
    queryFn: () => produceService.getCategories(),
  });
};

export const useSearchProduce = (query: string, limit = 20) => {
  return useQuery({
    queryKey: produceKeys.search(query),
    queryFn: () => produceService.searchProduce(query, limit),
    enabled: query.length > 0,
  });
};

// Mutations
export const useCreateProduce = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProduceRequest) =>
      produceService.createProduce(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produceKeys.all });
      // Also invalidate the listing produce list used in ListingManagement
      queryClient.invalidateQueries({ queryKey: ['listings', 'produce'] });
    },
  });
};

export const useUpdateProduce = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProduceRequest }) =>
      produceService.updateProduce(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: produceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: produceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['listings', 'produce'] });
    },
  });
};

export const useDeleteProduce = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hard = false }: { id: string; hard?: boolean }) =>
      produceService.deleteProduce(id, hard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['listings', 'produce'] });
    },
  });
};

export const useActivateProduce = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => produceService.activateProduce(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: produceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: produceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['listings', 'produce'] });
    },
  });
};

export const useDeactivateProduce = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => produceService.deactivateProduce(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: produceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: produceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['listings', 'produce'] });
    },
  });
};
