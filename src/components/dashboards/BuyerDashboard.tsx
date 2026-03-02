import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useActiveListings, useBuyerBids, useProduceList } from '@/hooks/useListings';
import { useUserTransactions } from '@/hooks/useTransactions';
import ListingCard from '@/components/ListingCard';
import { Search, Info, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CounterOfferDialog from '@/components/CounterOfferDialog';
import { Bid, Listing } from '@/types/produce';
import DeliveryTrackingList from '@/components/DeliveryTrackingList';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchProduce, setSearchProduce] = useState('all');
  const [selectedCounterBid, setSelectedCounterBid] = useState<Bid | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Fetch data
  const { data: produceList } = useProduceList();
  const { data: listingsData, isLoading: listingsLoading } = useActiveListings(
    1,
    50,
    searchProduce !== 'all' ? searchProduce : undefined
  );
  const { data: bidsData, isLoading: bidsLoading } = useBuyerBids(1, 50);
  const { data: transactionsData, isLoading: transactionsLoading } = useUserTransactions('buyer', 1, 50, 'pending');

  const activeListings = listingsData?.items || [];
  const myBids = bidsData?.items || [];
  const counterBids = myBids.filter(b => b.status === 'counter');
  const pendingPaymentTransactions = transactionsData?.items || [];

  const handlePayNow = (transaction: typeof pendingPaymentTransactions[0]) => {
    navigate('/payment', {
      state: {
        transactionId: transaction.id,
        produceName: transaction.produce_name,
        sellerName: transaction.seller_name,
        sellerId: transaction.seller_id,
        quantity: transaction.quantity,
        pricePerUnit: transaction.price_per_unit,
        totalAmount: transaction.buyer_total_amount,
      }
    });
  };

  if (listingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  {produceList?.filter(p => p.is_active).map(p => (
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
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
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
                      <TableCell className="font-medium">{transaction.produce_name}</TableCell>
                      <TableCell>{transaction.quantity} kg</TableCell>
                      <TableCell>₹{transaction.price_per_unit}/kg</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">₹{transaction.buyer_total_amount.toFixed(2)}</span>
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
                                    <span>₹{transaction.base_amount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>GST:</span>
                                    <span>+₹{transaction.buyer_gst_amount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Platform Fee:</span>
                                    <span>+₹{transaction.buyer_platform_fee.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold border-t pt-1">
                                    <span>Total Payable:</span>
                                    <span>₹{transaction.buyer_total_amount.toFixed(2)}</span>
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
            )}
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
            {bidsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Your Bid</TableHead>
                    <TableHead>Counter Offer</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {counterBids.map(bid => {
                    const listing = activeListings.find(l => l.id === bid.listing_id);
                    return (
                      <TableRow key={bid.id}>
                        <TableCell>{bid.quantity} kg</TableCell>
                        <TableCell>₹{bid.price_per_unit}/kg</TableCell>
                        <TableCell className="font-semibold text-primary">₹{bid.counter_price}/kg</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCounterBid(bid);
                              setSelectedListing(listing || null);
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
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Available Listings ({activeListings.length})
        </h2>
        {activeListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No listings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeListings.map(listing => (
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
          produceName={selectedListing?.produce_name || ''}
          sellerId={selectedListing?.seller_id || ''}
          open={!!selectedCounterBid}
          onOpenChange={(open) => !open && setSelectedCounterBid(null)}
        />
      )}
    </div>
  );
};

export default BuyerDashboard;
