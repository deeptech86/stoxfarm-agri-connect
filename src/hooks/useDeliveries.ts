/**
 * React Query hooks for deliveries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deliveryService,
  CreateDeliveryRequest,
  UpdateDeliveryRequest,
  UpdateStatusRequest,
  CreateDriverRequest,
} from '@/services/delivery.service';

// Query keys
export const deliveryKeys = {
  all: ['deliveries'] as const,
  detail: (id: string) => [...deliveryKeys.all, 'detail', id] as const,
  tracking: (trackingNumber: string) => [...deliveryKeys.all, 'tracking', trackingNumber] as const,
  logistics: (page?: number, status?: string) => [...deliveryKeys.all, 'logistics', page, status] as const,
  driver: (driverId: string, page?: number, status?: string) =>
    [...deliveryKeys.all, 'driver', driverId, page, status] as const,
  active: (page?: number) => [...deliveryKeys.all, 'active', page] as const,
  drivers: ['drivers'] as const,
  driverDetail: (id: string) => [...deliveryKeys.drivers, 'detail', id] as const,
  availableDrivers: (vehicleType?: string) => [...deliveryKeys.drivers, 'available', vehicleType] as const,
};

// Delivery Hooks
export const useDelivery = (id: string) => {
  return useQuery({
    queryKey: deliveryKeys.detail(id),
    queryFn: () => deliveryService.getDelivery(id),
    enabled: !!id,
  });
};

export const useDeliveryByTracking = (trackingNumber: string) => {
  return useQuery({
    queryKey: deliveryKeys.tracking(trackingNumber),
    queryFn: () => deliveryService.getByTrackingNumber(trackingNumber),
    enabled: !!trackingNumber,
  });
};

export const useLogisticsDeliveries = (page = 1, pageSize = 20, status?: string) => {
  return useQuery({
    queryKey: deliveryKeys.logistics(page, status),
    queryFn: () => deliveryService.getLogisticsDeliveries(page, pageSize, status),
  });
};

export const useDriverDeliveries = (driverId: string, page = 1, pageSize = 20, status?: string) => {
  return useQuery({
    queryKey: deliveryKeys.driver(driverId, page, status),
    queryFn: () => deliveryService.getDriverDeliveries(driverId, page, pageSize, status),
    enabled: !!driverId,
  });
};

export const useActiveDeliveries = (page = 1, pageSize = 50) => {
  return useQuery({
    queryKey: deliveryKeys.active(page),
    queryFn: () => deliveryService.getActiveDeliveries(page, pageSize),
  });
};

// Driver Hooks
export const useDriver = (id: string) => {
  return useQuery({
    queryKey: deliveryKeys.driverDetail(id),
    queryFn: () => deliveryService.getDriver(id),
    enabled: !!id,
  });
};

export const useAvailableDrivers = (vehicleType?: string, limit = 20) => {
  return useQuery({
    queryKey: deliveryKeys.availableDrivers(vehicleType),
    queryFn: () => deliveryService.getAvailableDrivers(vehicleType, limit),
  });
};

// Delivery Mutations
export const useCreateDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeliveryRequest) => deliveryService.createDelivery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
    },
  });
};

export const useUpdateDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeliveryRequest }) =>
      deliveryService.updateDelivery(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
    },
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusRequest }) =>
      deliveryService.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
    },
  });
};

export const useUpdateDeliveryLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, latitude, longitude }: { id: string; latitude: number; longitude: number }) =>
      deliveryService.updateLocation(id, latitude, longitude),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
    },
  });
};

export const useAssignDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deliveryId, driverId }: { deliveryId: string; driverId: string }) =>
      deliveryService.assignDriver(deliveryId, driverId),
    onSuccess: (_, { deliveryId }) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(deliveryId) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
    },
  });
};

// Driver Mutations
export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDriverRequest) => deliveryService.createDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.drivers });
    },
  });
};

export const useUpdateDriverAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driverId, isAvailable }: { driverId: string; isAvailable: boolean }) =>
      deliveryService.updateDriverAvailability(driverId, isAvailable),
    onSuccess: (_, { driverId }) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.driverDetail(driverId) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.drivers });
    },
  });
};
