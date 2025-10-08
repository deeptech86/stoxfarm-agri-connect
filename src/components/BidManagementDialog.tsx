import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bid } from '@/types/produce';
import { useNotifications } from '@/contexts/NotificationContext';
import { updateBid, addTransaction, mockUsers } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Check, X, MessageSquare } from 'lucide-react';

interface BidManagementDialogProps {
  bid: Bid;
  produceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BidManagementDialog = ({ bid, produceName, open, onOpenChange }: BidManagementDialogProps) => {
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterPrice, setCounterPrice] = useState(bid.pricePerUnit.toString());

  const handleAccept = () => {
    updateBid(bid.id, { status: 'accepted' });
    
    // Create transaction
    const seller = mockUsers.find(u => u.id === bid.listingId.split('-')[0]);
    const buyer = mockUsers.find(u => u.id === bid.buyerId);
    const logistics = mockUsers.filter(u => u.role === 'logistics');
    
    addTransaction({
      id: `txn-${Date.now()}`,
      sellerName: seller?.name || 'Unknown Seller',
      buyerName: bid.buyerName,
      produceName: produceName,
      quantity: bid.quantity,
      totalAmount: bid.quantity * bid.pricePerUnit,
      createdAt: new Date(),
    });

    // Notify buyer
    addNotification(
      bid.buyerId,
      `Your bid for ${produceName} has been accepted! Order confirmed for ${bid.quantity}kg at ₹${bid.pricePerUnit}/kg`,
      'success'
    );

    // Notify all logistics users
    logistics.forEach(logistic => {
      addNotification(
        logistic.id,
        `New delivery confirmed: ${produceName} - ${bid.quantity}kg from ${seller?.name} to ${bid.buyerName}`,
        'info'
      );
    });

    toast({
      title: 'Bid Accepted',
      description: 'Transaction created and notifications sent.',
    });

    onOpenChange(false);
  };

  const handleReject = () => {
    updateBid(bid.id, { status: 'rejected' });
    
    addNotification(
      bid.buyerId,
      `Your bid for ${produceName} has been rejected by the seller.`,
      'warning'
    );

    toast({
      title: 'Bid Rejected',
      description: 'Buyer has been notified.',
    });

    onOpenChange(false);
  };

  const handlePropose = () => {
    const proposedPrice = parseFloat(counterPrice);
    
    if (proposedPrice <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid counter price.',
        variant: 'destructive',
      });
      return;
    }

    updateBid(bid.id, { status: 'counter', counterPrice: proposedPrice });
    
    addNotification(
      bid.buyerId,
      `Counter offer for ${produceName}: Seller proposes ₹${proposedPrice}/kg for ${bid.quantity}kg. Total: ₹${(bid.quantity * proposedPrice).toFixed(2)}`,
      'info'
    );

    toast({
      title: 'Counter Offer Sent',
      description: 'Buyer has been notified of your proposal.',
    });

    onOpenChange(false);
  };

  const totalAmount = bid.quantity * bid.pricePerUnit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Bid</DialogTitle>
          <DialogDescription>
            {produceName} - Bid from {bid.buyerName}
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
              <p className="text-lg font-semibold">₹{bid.pricePerUnit}</p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-muted-foreground">Total Amount</Label>
            <p className="text-2xl font-bold text-primary">₹{totalAmount.toFixed(2)}</p>
          </div>

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
              <p className="text-xs text-muted-foreground">
                New total: ₹{(bid.quantity * parseFloat(counterPrice || '0')).toFixed(2)}
              </p>
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
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Propose Counter
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={handleAccept}
                className="w-full sm:w-auto"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowCounterInput(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePropose}
                className="w-full sm:w-auto"
              >
                Send Proposal
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BidManagementDialog;
