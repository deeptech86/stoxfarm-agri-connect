import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Listing } from '@/types/produce';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBid } from '@/hooks/useListings';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PlaceBidDialogProps {
  listing: Listing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlaceBidDialog = ({ listing, open, onOpenChange }: PlaceBidDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createBidMutation = useCreateBid();

  const [quantity, setQuantity] = useState(listing.min_order_qty.toString());
  const [pricePerUnit, setPricePerUnit] = useState(listing.item_rate.toString());
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const bidQuantity = parseInt(quantity);
    const bidPrice = parseFloat(pricePerUnit);

    if (bidQuantity < listing.min_order_qty) {
      toast({
        title: 'Invalid Quantity',
        description: `Minimum order quantity is ${listing.min_order_qty} kg`,
        variant: 'destructive',
      });
      return;
    }

    if (bidQuantity > listing.available_quantity) {
      toast({
        title: 'Invalid Quantity',
        description: `Only ${listing.available_quantity} kg available`,
        variant: 'destructive',
      });
      return;
    }

    try {
      await createBidMutation.mutateAsync({
        listing_id: listing.id,
        quantity: bidQuantity,
        price_per_unit: bidPrice,
        notes: notes || undefined,
      });

      toast({
        title: 'Bid Placed',
        description: 'Your bid has been sent to the seller for review.',
      });

      onOpenChange(false);
      setQuantity(listing.min_order_qty.toString());
      setPricePerUnit(listing.item_rate.toString());
      setNotes('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place bid. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Calculate total amount
  const baseAmount = parseFloat(quantity) * parseFloat(pricePerUnit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Place Bid</DialogTitle>
          <DialogDescription>
            {listing.produce_name} - Seller's Price: ₹{listing.item_rate}/kg
            <span className="block text-xs mt-1">(Mandi Rate: ₹{listing.mandi_rate}/kg)</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (kg)</Label>
            <Input
              id="quantity"
              data-testid="bid-quantity-input"
              type="number"
              min={listing.min_order_qty}
              max={listing.available_quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Min: {listing.min_order_qty} kg, Available: {listing.available_quantity} kg
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price per Unit (₹/kg)</Label>
            <Input
              id="price"
              data-testid="bid-price-input"
              type="number"
              step="0.01"
              min="0"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes for the seller..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Bid Amount</p>
            <p className="text-2xl font-bold text-primary">
              ₹{isNaN(baseAmount) ? '0.00' : baseAmount.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              * GST and platform fees will be calculated upon acceptance
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBidMutation.isPending} data-testid="submit-bid-btn">
              {createBidMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Bid...
                </>
              ) : (
                'Place Bid'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceBidDialog;
