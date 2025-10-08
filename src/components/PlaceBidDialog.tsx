import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Listing } from '@/types/produce';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { addBid } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface PlaceBidDialogProps {
  listing: Listing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlaceBidDialog = ({ listing, open, onOpenChange }: PlaceBidDialogProps) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(listing.minOrderQty.toString());
  const [pricePerUnit, setPricePerUnit] = useState(listing.mandiRate.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const bidQuantity = parseInt(quantity);
    const bidPrice = parseFloat(pricePerUnit);

    if (bidQuantity < listing.minOrderQty) {
      toast({
        title: 'Invalid Quantity',
        description: `Minimum order quantity is ${listing.minOrderQty} kg`,
        variant: 'destructive',
      });
      return;
    }

    const newBid = {
      id: `bid-${Date.now()}`,
      listingId: listing.id,
      buyerId: user.id,
      buyerName: user.name,
      quantity: bidQuantity,
      pricePerUnit: bidPrice,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    addBid(newBid);
    addNotification(
      listing.sellerId,
      `New bid received for ${listing.produceName}: ${bidQuantity}kg at ₹${bidPrice}/kg from ${user.name}`,
      'info'
    );

    toast({
      title: 'Bid Placed',
      description: 'Your bid has been sent to the seller for review.',
    });

    onOpenChange(false);
  };

  const totalAmount = parseFloat(quantity) * parseFloat(pricePerUnit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Place Bid</DialogTitle>
          <DialogDescription>
            {listing.produceName} - Mandi Rate: ₹{listing.mandiRate}/kg
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (kg)</Label>
            <Input
              id="quantity"
              type="number"
              min={listing.minOrderQty}
              max={listing.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Min: {listing.minOrderQty} kg, Available: {listing.quantity} kg
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price per Unit (₹/kg)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              required
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">
              ₹{isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2)}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Place Bid</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceBidDialog;
