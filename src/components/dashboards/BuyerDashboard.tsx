import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { mockListings, produceList, mockBids, mockUsers, mockSatelliteCenters, mockTransactions } from '@/lib/mockData';
import ListingCard from '@/components/ListingCard';
import { Search, Info, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CounterOfferDialog from '@/components/CounterOfferDialog';
import { Bid } from '@/types/produce';
import DeliveryTrackingList from '@/components/DeliveryTrackingList';

// Helper function to calculate buyer's total amount (with GST and Platform Fee)
const calculateBuyerTotalAmount = (
  bid: Bid,
  produceName: string,
  sellerId: string,
  buyerId: string
) => {
  const baseAmount = bid.quantity * bid.pricePerUnit;

  // Get GST from seller's crop details
  const seller = mockUsers.find(u => u.id === sellerId);
  let gstPercentage = 0;
  if (seller?.cropDetails) {
    const cropDetail = seller.cropDetails.find(c => c.cropName === produceName);
    if (cropDetail) {
      gstPercentage = cropDetail.gst;
    }
  }

  // Get platform fee from buyer's satellite center
  const buyer = mockUsers.find(u => u.id === buyerId);
  let platformFeePercentage = 0;
  if (buyer?.satelliteCenterId) {
    const center = mockSatelliteCenters.find(c => c.id === buyer.satelliteCenterId);
    if (center) {
      platformFeePercentage = center.platformFee;
    }
  }

  const gstAmount = (baseAmount * gstPercentage) / 100;
  const platformFeeAmount = (baseAmount * platformFeePercentage) / 100;
  const totalAmount = baseAmount + gstAmount + platformFeeAmount;

  return {
    baseAmount,
    gstPercentage,
    gstAmount,
    platformFeePercentage,
    platformFeeAmount,
    totalAmount,
    hasCharges: gstPercentage > 0 || platformFeePercentage > 0,
  };
};

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchProduce, setSearchProduce] = useState('all');
  const [selectedCounterBid, setSelectedCounterBid] = useState<Bid | null>(null);
  const [selectedProduceName, setSelectedProduceName] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState('');

  const activeListings = mockListings.filter(l => l.status === 'active');
  const filteredListings = searchProduce === 'all'
    ? activeListings
    : activeListings.filter(l => l.produceName.toLowerCase().includes(searchProduce.toLowerCase()));

  // Get my bids
  const myBids = mockBids.filter(b => b.buyerId === user?.id);
  const pendingBids = myBids.filter(b => b.status === 'pending');
  const counterBids = myBids.filter(b => b.status === 'counter');

  // Get pending payment transactions (transactions with paymentStatus = 'pending')
  const pendingPaymentTransactions = mockTransactions.filter(
    t => t.buyerId === user?.id && t.paymentStatus === 'pending'
  );

  const handlePayNow = (transaction: typeof mockTransactions[0]) => {
    // Navigate to payment page with transaction details
    navigate('/payment', {
      state: {
        transactionId: transaction.id,
        produceName: transaction.produceName,
        sellerName: transaction.sellerName,
        sellerId: transaction.sellerId,
        quantity: transaction.quantity,
        pricePerUnit: transaction.pricePerUnit,
        totalAmount: transaction.buyerPaidAmount,
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Listings</h1>
        <p className="text-muted-foreground">Find and bid on fresh produce</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Produce</CardTitle>
          <CardDescription>Find listings by produce type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="produce">Select Produce</Label>
              <Select value={searchProduce} onValueChange={setSearchProduce}>
                <SelectTrigger id="produce">
                  <SelectValue placeholder="All produce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Produce</SelectItem>
                  {produceList.map(p => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments Section */}
      {pendingPaymentTransactions.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle className="text-green-800">Pending Payments</CardTitle>
                <CardDescription>Complete payment for accepted bids</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Produce</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPaymentTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.sellerName}</TableCell>
                    <TableCell>{transaction.produceName}</TableCell>
                    <TableCell>{transaction.quantity} kg</TableCell>
                    <TableCell>₹{transaction.pricePerUnit}/kg</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">₹{transaction.buyerPaidAmount.toFixed(2)}</span>
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
                                  <span>₹{transaction.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>GST + Platform Fee:</span>
                                  <span>+₹{(transaction.buyerPaidAmount - transaction.totalAmount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t pt-1">
                                  <span>Total Payable:</span>
                                  <span>₹{transaction.buyerPaidAmount.toFixed(2)}</span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handlePayNow(transaction)}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pay Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {counterBids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Counter Offers</CardTitle>
            <CardDescription>Sellers have proposed different prices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produce</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Your Bid</TableHead>
                  <TableHead>Counter Offer</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counterBids.map(bid => {
                  const listing = mockListings.find(l => l.id === bid.listingId);
                  return (
                    <TableRow key={bid.id}>
                      <TableCell>{listing?.produceName}</TableCell>
                      <TableCell>{bid.quantity} kg</TableCell>
                      <TableCell>₹{bid.pricePerUnit}/kg</TableCell>
                      <TableCell className="font-semibold text-primary">₹{bid.counterPrice}/kg</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCounterBid(bid);
                            setSelectedProduceName(listing?.produceName || '');
                            setSelectedSellerId(listing?.sellerId || '');
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Available Listings ({filteredListings.length})
        </h2>
        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No listings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} showActions userRole="buyer" />
            ))}
          </div>
        )}
      </div>

      {/* Delivery Tracking */}
      <DeliveryTrackingList filterByRole="buyer" userId={user?.id} />

      {selectedCounterBid && (
        <CounterOfferDialog
          bid={selectedCounterBid}
          produceName={selectedProduceName}
          sellerId={selectedSellerId}
          open={!!selectedCounterBid}
          onOpenChange={(open) => !open && setSelectedCounterBid(null)}
        />
      )}
    </div>
  );
};

export default BuyerDashboard;
