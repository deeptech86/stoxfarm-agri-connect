import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bid } from '@/types/produce';
import { useAcceptCounter, useWithdrawBid } from '@/hooks/useListings';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CounterOfferDialogProps {
  bid: Bid;
  produceName: string;
  sellerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CounterOfferDialog = ({ bid, produceName, sellerId, open, onOpenChange }: CounterOfferDialogProps) => {
  const { toast } = useToast();
  const acceptCounterMutation = useAcceptCounter();
  const withdrawBidMutation = useWithdrawBid();

  const isLoading = acceptCounterMutation.isPending || withdrawBidMutation.isPending;

  const handleAcceptCounter = async () => {
    try {
      await acceptCounterMutation.mutateAsync(bid.id);

      toast({
        title: 'Counter Offer Accepted',
        description: 'Transaction created and notifications sent.',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept counter offer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectCounter = async () => {
    try {
      await withdrawBidMutation.mutateAsync(bid.id);

      toast({
        title: 'Counter Offer Rejected',
        description: 'Seller has been notified.',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject counter offer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const totalAmount = bid.quantity * (bid.counter_price || bid.price_per_unit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Counter Offer Received</DialogTitle>
          <DialogDescription>
            Seller has proposed a different price for {produceName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Your Bid</Label>
              <p className="text-lg font-semibold line-through text-muted-foreground">
                ₹{bid.price_per_unit}/kg
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Counter Offer</Label>
              <p className="text-lg font-semibold text-primary">
                ₹{bid.counter_price}/kg
              </p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Quantity</Label>
            <p className="text-lg font-semibold">{bid.quantity} kg</p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-muted-foreground">New Total Amount</Label>
            <p className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRejectCounter}
            className="flex-1"
            disabled={isLoading}
          >
            {withdrawBidMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Reject
          </Button>
          <Button
            onClick={handleAcceptCounter}
            className="flex-1"
            disabled={isLoading}
          >
            {acceptCounterMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Accept Counter Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CounterOfferDialog;
