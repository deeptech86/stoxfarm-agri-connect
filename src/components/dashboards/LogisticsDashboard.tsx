import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogisticsDeliveries, useActiveDeliveries, useAvailableDrivers, useAssignDriver } from '@/hooks/useDeliveries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, MapPin, Loader2, Phone, Clock, Truck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DeliveryTrackingList from '@/components/DeliveryTrackingList';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const LogisticsDashboard = () => {
  const { data: deliveriesData, isLoading: deliveriesLoading, refetch: refetchDeliveries } = useLogisticsDeliveries(1, 100);
  const { data: activeDeliveriesData } = useActiveDeliveries(1, 100);
  const { data: availableDrivers } = useAvailableDrivers();
  const assignDriverMutation = useAssignDriver();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  const deliveries = deliveriesData?.items || [];
  const activeDeliveries = activeDeliveriesData?.items || [];
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');

  const pendingCount = pendingDeliveries.length;
  const assignedCount = deliveries.filter(d => d.status === 'assigned').length;
  const inTransitCount = deliveries.filter(d => d.status === 'in_transit' || d.status === 'picked_up').length;
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;

  const handleAssignDriver = async () => {
    if (!selectedDeliveryId || !selectedDriverId) return;

    try {
      await assignDriverMutation.mutateAsync({
        deliveryId: selectedDeliveryId,
        driverId: selectedDriverId,
      });
      toast({
        title: 'Driver Assigned',
        description: 'The driver has been assigned to this delivery.',
      });
      setAssignDialogOpen(false);
      setSelectedDeliveryId(null);
      setSelectedDriverId('');
      refetchDeliveries();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to assign driver. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Pickup</Badge>;
      case 'assigned':
        return <Badge variant="outline">Driver Assigned</Badge>;
      case 'picked_up':
        return <Badge className="bg-blue-500">Picked Up</Badge>;
      case 'in_transit':
        return <Badge className="bg-orange-500">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (deliveriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logistics Dashboard</h1>
        <p className="text-muted-foreground">Manage deliveries and shipments</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{deliveries.length}</CardTitle>
            <CardDescription>Total Deliveries</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
            <CardDescription>Pending Assignment</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{assignedCount}</CardTitle>
            <CardDescription>Assigned</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{inTransitCount}</CardTitle>
            <CardDescription>In Transit</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{deliveredCount}</CardTitle>
            <CardDescription>Delivered</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Pending Deliveries Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pending Deliveries
          </CardTitle>
          <CardDescription>Deliveries awaiting driver assignment</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingDeliveries.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No pending deliveries</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pick Address</TableHead>
                    <TableHead>Pickup Phone</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Delivery Address</TableHead>
                    <TableHead>Delivery Phone</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDeliveries.map(delivery => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <div className="flex items-start gap-1 max-w-[200px]">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{delivery.seller_name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{delivery.origin_address}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{delivery.pickup_phone || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{delivery.produce_name}</span>
                      </TableCell>
                      <TableCell>
                        <span>{delivery.quantity} kg</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1 max-w-[200px]">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{delivery.buyer_name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{delivery.dest_address}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{delivery.delivery_phone || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <div className="text-sm">
                            {delivery.estimated_arrival ? (
                              <>
                                <p>{format(new Date(delivery.estimated_arrival), 'MMM d, h:mm a')}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(delivery.estimated_arrival), { addSuffix: true })}
                                </p>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog open={assignDialogOpen && selectedDeliveryId === delivery.id} onOpenChange={(open) => {
                          setAssignDialogOpen(open);
                          if (!open) {
                            setSelectedDeliveryId(null);
                            setSelectedDriverId('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedDeliveryId(delivery.id)}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Driver</DialogTitle>
                              <DialogDescription>
                                Select a driver to assign to this delivery
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Available Drivers</label>
                                <Select
                                  value={selectedDriverId}
                                  onValueChange={setSelectedDriverId}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a driver" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableDrivers && availableDrivers.length > 0 ? (
                                      availableDrivers.map(driver => (
                                        <SelectItem key={driver.id} value={driver.id}>
                                          <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>{driver.name}</span>
                                            <span className="text-muted-foreground">({driver.vehicle_number})</span>
                                          </div>
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="" disabled>No available drivers</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleAssignDriver}
                                  disabled={!selectedDriverId || assignDriverMutation.isPending}
                                >
                                  {assignDriverMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Assigning...
                                    </>
                                  ) : (
                                    'Assign Driver'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Tracking Map */}
      <DeliveryTrackingList filterByRole="logistics" />

      <Card>
        <CardHeader>
          <CardTitle>Active Deliveries</CardTitle>
          <CardDescription>Orders in progress</CardDescription>
        </CardHeader>
        <CardContent>
          {activeDeliveries.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No active deliveries</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Produce</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeDeliveries.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-sm">{d.tracking_number}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{d.seller_name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{d.origin_address}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{d.buyer_name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{d.dest_address}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{d.produce_name}</TableCell>
                    <TableCell>{d.quantity} kg</TableCell>
                    <TableCell>
                      {d.driver ? (
                        <div>
                          <p className="font-medium">{d.driver.name}</p>
                          <p className="text-xs text-muted-foreground">{d.driver.vehicle_number}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(d.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogisticsDashboard;
