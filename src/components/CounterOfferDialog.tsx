import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bid } from '@/types/produce';
import { useNotifications } from '@/contexts/NotificationContext';
import { updateBid, addTransaction, mockUsers } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CounterOfferDialogProps {
  bid: Bid;
  produceName: string;
  sellerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CounterOfferDialog = ({ bid, produceName, sellerId, open, onOpenChange }: CounterOfferDialogProps) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  const handleAcceptCounter = () => {
    if (!user) return;

    updateBid(bid.id, { status: 'accepted', pricePerUnit: bid.counterPrice || bid.pricePerUnit });
    
    // Create transaction
    const seller = mockUsers.find(u => u.id === sellerId);
    const logistics = mockUsers.filter(u => u.role === 'logistics');
    
    const finalPrice = bid.counterPrice || bid.pricePerUnit;
    addTransaction({
      id: `txn-${Date.now()}`,
      sellerName: seller?.name || 'Unknown Seller',
      buyerName: user.name,
      produceName: produceName,
      quantity: bid.quantity,
      totalAmount: bid.quantity * finalPrice,
      createdAt: new Date(),
    });

    // Notify seller
    addNotification(
      sellerId,
      `Your counter offer for ${produceName} has been accepted! Order confirmed for ${bid.quantity}kg at ₹${finalPrice}/kg`,
      'success'
    );

    // Notify all logistics users
    logistics.forEach(logistic => {
      addNotification(
        logistic.id,
        `New delivery confirmed: ${produceName} - ${bid.quantity}kg from ${seller?.name} to ${user.name}`,
        'info'
      );
    });

    toast({
      title: 'Counter Offer Accepted',
      description: 'Transaction created and notifications sent.',
    });

    onOpenChange(false);
  };

  const handleRejectCounter = () => {
    updateBid(bid.id, { status: 'rejected' });
    
    addNotification(
      sellerId,
      `Buyer rejected your counter offer for ${produceName}.`,
      'warning'
    );

    toast({
      title: 'Counter Offer Rejected',
      description: 'Seller has been notified.',
    });

    onOpenChange(false);
  };

  const totalAmount = bid.quantity * (bid.counterPrice || bid.pricePerUnit);

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
                ₹{bid.pricePerUnit}/kg
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Counter Offer</Label>
              <p className="text-lg font-semibold text-primary">
                ₹{bid.counterPrice}/kg
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
          >
            Reject
          </Button>
          <Button 
            onClick={handleAcceptCounter}
            className="flex-1"
          >
            Accept Counter Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CounterOfferDialog;
