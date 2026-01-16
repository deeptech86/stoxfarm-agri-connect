import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Listing } from '@/types/produce';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { addBid, mockUsers, mockSatelliteCenters } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Info } from 'lucide-react';

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

  // Get GST from seller's crop details for this produce
  const gstPercentage = useMemo(() => {
    const seller = mockUsers.find(u => u.id === listing.sellerId);
    if (seller?.cropDetails) {
      const cropDetail = seller.cropDetails.find(c => c.cropName === listing.produceName);
      if (cropDetail) {
        return cropDetail.gst;
      }
    }
    return 0; // Default GST if not found
  }, [listing.sellerId, listing.produceName]);

  // Get platform fee from buyer's assigned satellite center
  const platformFeePercentage = useMemo(() => {
    if (user?.satelliteCenterId) {
      const center = mockSatelliteCenters.find(c => c.id === user.satelliteCenterId);
      if (center) {
        return center.platformFee;
      }
    }
    return 0; // Default platform fee if not assigned to a center
  }, [user?.satelliteCenterId]);

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

  // Calculate price breakdown
  const baseAmount = parseFloat(quantity) * parseFloat(pricePerUnit);
  const gstAmount = (baseAmount * gstPercentage) / 100;
  const platformFeeAmount = (baseAmount * platformFeePercentage) / 100;
  const totalAmount = baseAmount + gstAmount + platformFeeAmount;

  const hasCharges = gstPercentage > 0 || platformFeePercentage > 0;

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
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              {hasCharges && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px] p-3">
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold border-b pb-1">Price Breakdown</p>
                        <div className="flex justify-between">
                          <span>Base Amount:</span>
                          <span>₹{isNaN(baseAmount) ? '0.00' : baseAmount.toFixed(2)}</span>
                        </div>
                        {gstPercentage > 0 && (
                          <div className="flex justify-between">
                            <span>GST ({gstPercentage}%):</span>
                            <span>₹{isNaN(gstAmount) ? '0.00' : gstAmount.toFixed(2)}</span>
                          </div>
                        )}
                        {platformFeePercentage > 0 && (
                          <div className="flex justify-between">
                            <span>Platform Fee ({platformFeePercentage}%):</span>
                            <span>₹{isNaN(platformFeeAmount) ? '0.00' : platformFeeAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Total:</span>
                          <span>₹{isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-2xl font-bold text-primary">
              ₹{isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2)}
            </p>
            {hasCharges && (
              <p className="text-xs text-muted-foreground mt-2">
                * Includes GST ({gstPercentage}%) and Platform Fee ({platformFeePercentage}%). Hover <Info className="h-3 w-3 inline" /> for breakdown.
              </p>
            )}
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
