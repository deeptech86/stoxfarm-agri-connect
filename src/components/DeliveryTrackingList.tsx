import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package,
  ChevronRight,
  Navigation
} from 'lucide-react';
import { format } from 'date-fns';
import { mockDeliveries } from '@/lib/mockDeliveries';
import { DeliveryTracking } from '@/types/logistics';
import DeliveryTrackingDialog from './DeliveryTrackingDialog';

interface DeliveryTrackingListProps {
  filterByRole?: 'seller' | 'buyer' | 'logistics' | 'admin';
  userId?: string;
}

const DeliveryTrackingList: React.FC<DeliveryTrackingListProps> = ({ 
  filterByRole,
  userId 
}) => {
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryTracking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // For demo, show all deliveries. In real app, filter based on role/userId
  const deliveries = mockDeliveries;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'picked_up': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const handleTrackDelivery = (delivery: DeliveryTracking) => {
    setSelectedDelivery(delivery);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Live Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active deliveries
              </p>
            ) : (
              deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getStatusColor(delivery.status)}>
                          {getStatusLabel(delivery.status)}
                        </Badge>
                        <span className="font-semibold">{delivery.produceName}</span>
                        <span className="text-sm text-muted-foreground">
                          ({delivery.quantity} kg)
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{delivery.driver.name} • {delivery.driver.vehicleNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>ETA: {format(delivery.estimatedArrival, 'h:mm a')}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-foreground">{delivery.origin.address}</span>
                          <span className="mx-2">→</span>
                          <span className="text-foreground">{delivery.destination.address}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleTrackDelivery(delivery)}
                      className="gap-2 whitespace-nowrap"
                    >
                      <MapPin className="h-4 w-4" />
                      Track
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <DeliveryTrackingDialog
        delivery={selectedDelivery}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default DeliveryTrackingList;
