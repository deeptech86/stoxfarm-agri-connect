import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeliveryTracking } from '@/types/logistics';
import LogisticsTrackingMap from './LogisticsTrackingMap';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DeliveryTrackingDialogProps {
  delivery: DeliveryTracking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeliveryTrackingDialog: React.FC<DeliveryTrackingDialogProps> = ({
  delivery,
  open,
  onOpenChange,
}) => {
  if (!delivery) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            Track Delivery - {delivery.produceName}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6 pt-4">
            <LogisticsTrackingMap delivery={delivery} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryTrackingDialog;
