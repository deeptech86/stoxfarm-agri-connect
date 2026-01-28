/**
 * React Query hooks for satellite center management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  satelliteCenterService,
  CreateSatelliteCenterRequest,
  UpdateSatelliteCenterRequest,
} from '@/services/satellite-center.service';

// Query keys
export const satelliteCenterKeys = {
  all: ['satellite-centers'] as const,
  list: (page?: number, city?: string, state?: string, activeOnly?: boolean) =>
    [...satelliteCenterKeys.all, 'list', page, city, state, activeOnly] as const,
  detail: (id: string) => [...satelliteCenterKeys.all, 'detail', id] as const,
  search: (query: string) => [...satelliteCenterKeys.all, 'search', query] as const,
};

// Hooks
export const useSatelliteCenters = (
  page = 1,
  pageSize = 20,
  city?: string,
  state?: string,
  activeOnly = false
) => {
  return useQuery({
    queryKey: satelliteCenterKeys.list(page, city, state, activeOnly),
    queryFn: () => satelliteCenterService.getSatelliteCenters(page, pageSize, city, state, activeOnly),
  });
};

export const useSatelliteCenter = (id: string) => {
  return useQuery({
    queryKey: satelliteCenterKeys.detail(id),
    queryFn: () => satelliteCenterService.getSatelliteCenter(id),
    enabled: !!id,
  });
};

export const useSearchSatelliteCenters = (query: string, limit = 20) => {
  return useQuery({
    queryKey: satelliteCenterKeys.search(query),
    queryFn: () => satelliteCenterService.searchSatelliteCenters(query, limit),
    enabled: query.length > 0,
  });
};

// Mutations
export const useCreateSatelliteCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSatelliteCenterRequest) =>
      satelliteCenterService.createSatelliteCenter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: satelliteCenterKeys.all });
    },
  });
};

export const useUpdateSatelliteCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSatelliteCenterRequest }) =>
      satelliteCenterService.updateSatelliteCenter(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: satelliteCenterKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: satelliteCenterKeys.all });
    },
  });
};

export const useDeleteSatelliteCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hard = false }: { id: string; hard?: boolean }) =>
      satelliteCenterService.deleteSatelliteCenter(id, hard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: satelliteCenterKeys.all });
    },
  });
};

export const useActivateSatelliteCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => satelliteCenterService.activateSatelliteCenter(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: satelliteCenterKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: satelliteCenterKeys.all });
    },
  });
};

export const useDeactivateSatelliteCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => satelliteCenterService.deactivateSatelliteCenter(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: satelliteCenterKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: satelliteCenterKeys.all });
    },
  });
};
