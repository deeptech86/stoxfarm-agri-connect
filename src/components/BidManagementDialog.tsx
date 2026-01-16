import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bid } from '@/types/produce';
import { useNotifications } from '@/contexts/NotificationContext';
import { updateBid, addTransaction, mockUsers, mockSatelliteCenters } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Check, X, MessageSquare, Info } from 'lucide-react';

interface BidManagementDialogProps {
  bid: Bid;
  produceName: string;
  sellerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BidManagementDialog = ({ bid, produceName, sellerId, open, onOpenChange }: BidManagementDialogProps) => {
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterPrice, setCounterPrice] = useState(bid.pricePerUnit.toString());

  // Get GST from seller's crop details for this produce
  const gstPercentage = useMemo(() => {
    const seller = mockUsers.find(u => u.id === sellerId);
    if (seller?.cropDetails) {
      const cropDetail = seller.cropDetails.find(c => c.cropName === produceName);
      if (cropDetail) {
        return cropDetail.gst;
      }
    }
    return 0;
  }, [sellerId, produceName]);

  // Get platform fee from seller's assigned satellite center
  const platformFeePercentage = useMemo(() => {
    const seller = mockUsers.find(u => u.id === sellerId);
    if (seller?.satelliteCenterId) {
      const center = mockSatelliteCenters.find(c => c.id === seller.satelliteCenterId);
      if (center) {
        return center.platformFee;
      }
    }
    return 0;
  }, [sellerId]);

  const handleAccept = () => {
    updateBid(bid.id, { status: 'accepted' });

    // Create transaction
    const seller = mockUsers.find(u => u.id === sellerId);
    const buyer = mockUsers.find(u => u.id === bid.buyerId);
    const logistics = mockUsers.filter(u => u.role === 'logistics');

    // Calculate buyer's total (base + GST + platform fee from buyer's center)
    const baseAmount = bid.quantity * bid.pricePerUnit;

    // Get buyer's platform fee
    let buyerPlatformFeePercentage = 0;
    if (buyer?.satelliteCenterId) {
      const buyerCenter = mockSatelliteCenters.find(c => c.id === buyer.satelliteCenterId);
      if (buyerCenter) {
        buyerPlatformFeePercentage = buyerCenter.platformFee;
      }
    }

    const buyerGstAmount = (baseAmount * gstPercentage) / 100;
    const buyerPlatformFeeAmount = (baseAmount * buyerPlatformFeePercentage) / 100;
    const buyerPaidAmount = baseAmount + buyerGstAmount + buyerPlatformFeeAmount;

    // Seller payout is already calculated (netAmount)
    const sellerPayoutAmount = netAmount;

    addTransaction({
      id: `txn-${Date.now()}`,
      sellerId: sellerId,
      buyerId: bid.buyerId,
      sellerName: seller?.name || 'Unknown Seller',
      buyerName: bid.buyerName,
      produceName: produceName,
      quantity: bid.quantity,
      pricePerUnit: bid.pricePerUnit,
      totalAmount: baseAmount,
      buyerPaidAmount: buyerPaidAmount,
      sellerPayoutAmount: sellerPayoutAmount,
      paymentStatus: 'pending',
      sellerPaid: false,
      createdAt: new Date(),
    });

    // Notify buyer
    addNotification(
      bid.buyerId,
      `Your bid for ${produceName} has been accepted! Order confirmed for ${bid.quantity}kg at ₹${bid.pricePerUnit}/kg. Please complete the payment.`,
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

  // Calculate price breakdown for seller (deductions)
  const grossAmount = bid.quantity * bid.pricePerUnit;
  const gstDeduction = (grossAmount * gstPercentage) / 100;
  const platformFeeDeduction = (grossAmount * platformFeePercentage) / 100;
  const netAmount = grossAmount - gstDeduction - platformFeeDeduction;

  const hasDeductions = gstPercentage > 0 || platformFeePercentage > 0;

  // Calculate net amount for counter offer
  const counterGrossAmount = bid.quantity * parseFloat(counterPrice || '0');
  const counterGstDeduction = (counterGrossAmount * gstPercentage) / 100;
  const counterPlatformFeeDeduction = (counterGrossAmount * platformFeePercentage) / 100;
  const counterNetAmount = counterGrossAmount - counterGstDeduction - counterPlatformFeeDeduction;

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
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground">You Will Receive</Label>
              {hasDeductions && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px] p-3">
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold border-b pb-1">Amount Breakdown</p>
                        <div className="flex justify-between">
                          <span>Gross Amount:</span>
                          <span>₹{grossAmount.toFixed(2)}</span>
                        </div>
                        {gstPercentage > 0 && (
                          <div className="flex justify-between text-destructive">
                            <span>GST Deduction ({gstPercentage}%):</span>
                            <span>-₹{gstDeduction.toFixed(2)}</span>
                          </div>
                        )}
                        {platformFeePercentage > 0 && (
                          <div className="flex justify-between text-destructive">
                            <span>Platform Fee ({platformFeePercentage}%):</span>
                            <span>-₹{platformFeeDeduction.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold border-t pt-1 text-green-600">
                          <span>Net Amount:</span>
                          <span>₹{netAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-2xl font-bold text-primary">₹{netAmount.toFixed(2)}</p>
            {hasDeductions && (
              <p className="text-xs text-muted-foreground mt-2">
                * After GST ({gstPercentage}%) and Platform Fee ({platformFeePercentage}%) deductions. Hover <Info className="h-3 w-3 inline" /> for breakdown.
              </p>
            )}
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
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Gross amount: ₹{counterGrossAmount.toFixed(2)}</p>
                {hasDeductions && (
                  <p className="text-green-600 font-medium">
                    You will receive: ₹{counterNetAmount.toFixed(2)} (after deductions)
                  </p>
                )}
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
