import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bid } from '@/types/produce';
import { useAcceptBid, useRejectBid, useCounterBid } from '@/hooks/useListings';
import { useToast } from '@/hooks/use-toast';
import { Check, X, MessageSquare, Loader2 } from 'lucide-react';

interface BidManagementDialogProps {
  bid: Bid;
  produceName: string;
  sellerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BidManagementDialog = ({ bid, produceName, sellerId, open, onOpenChange }: BidManagementDialogProps) => {
  const { toast } = useToast();
  const acceptBidMutation = useAcceptBid();
  const rejectBidMutation = useRejectBid();
  const counterBidMutation = useCounterBid();

  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterPrice, setCounterPrice] = useState(bid.price_per_unit.toString());

  const isLoading = acceptBidMutation.isPending || rejectBidMutation.isPending || counterBidMutation.isPending;

  const handleAccept = async () => {
    try {
      await acceptBidMutation.mutateAsync(bid.id);
      toast({
        title: 'Bid Accepted',
        description: 'Transaction created and notifications sent.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept bid. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    try {
      await rejectBidMutation.mutateAsync({ bidId: bid.id });
      toast({
        title: 'Bid Rejected',
        description: 'Buyer has been notified.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject bid. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePropose = async () => {
    const proposedPrice = parseFloat(counterPrice);

    if (proposedPrice <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid counter price.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await counterBidMutation.mutateAsync({
        bidId: bid.id,
        data: { counter_price: proposedPrice },
      });
      toast({
        title: 'Counter Offer Sent',
        description: 'Buyer has been notified of your proposal.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send counter offer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Calculate amounts
  const grossAmount = bid.quantity * bid.price_per_unit;
  const counterGrossAmount = bid.quantity * parseFloat(counterPrice || '0');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Bid</DialogTitle>
          <DialogDescription>
            {produceName} - Bid from {bid.buyer_name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Quantity</Label>
              <p className="text-lg font-semibold">{bid.quantity} kg</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Price per kg</Label>
              <p className="text-lg font-semibold">₹{bid.price_per_unit}</p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-muted-foreground">Total Bid Amount</Label>
            <p className="text-2xl font-bold text-primary">₹{bid.total_amount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              * GST and platform fees will be calculated upon acceptance
            </p>
          </div>

          {bid.notes && (
            <div>
              <Label className="text-muted-foreground">Buyer's Notes</Label>
              <p className="text-sm">{bid.notes}</p>
            </div>
          )}

          {showCounterInput && (
            <div className="space-y-2">
              <Label htmlFor="counter-price">Counter Price (₹/kg)</Label>
              <Input
                id="counter-price"
                type="number"
                step="0.01"
                min="0"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                <p>New total amount: ₹{isNaN(counterGrossAmount) ? '0.00' : counterGrossAmount.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!showCounterInput ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowCounterInput(true)}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Propose Counter
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {rejectBidMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
              <Button
                onClick={handleAccept}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {acceptBidMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Accept
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowCounterInput(false)}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePropose}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {counterBidMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Proposal'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BidManagementDialog;
