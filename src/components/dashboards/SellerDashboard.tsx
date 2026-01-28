import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Info, Loader2 } from 'lucide-react';
import { useSellerListings, useSellerBids } from '@/hooks/useListings';
import ListingCard from '@/components/ListingCard';
import CreateListingDialog from '@/components/CreateListingDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BidManagementDialog from '@/components/BidManagementDialog';
import { Bid, Listing } from '@/types/produce';
import DeliveryTrackingList from '@/components/DeliveryTrackingList';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Fetch seller's listings
  const { data: listingsData, isLoading: listingsLoading } = useSellerListings();

  // Fetch seller's bids (pending bids on their listings)
  const { data: bidsData, isLoading: bidsLoading } = useSellerBids(1, 50, 'pending');

  const myListings = listingsData?.items || [];
  const pendingBids = bidsData?.items || [];

  const activeCount = myListings.filter(l => l.status === 'active').length;
  const expiredCount = myListings.filter(l => l.status === 'expired').length;

  if (listingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your produce listings</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{pendingBids.length}</CardTitle>
            <CardDescription>Pending Bids</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{activeCount}</CardTitle>
            <CardDescription>Active Listings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{expiredCount}</CardTitle>
            <CardDescription>Expired Listings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{myListings.length}</CardTitle>
            <CardDescription>Total Listings</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {pendingBids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Bids</CardTitle>
            <CardDescription>Review and respond to buyer bids</CardDescription>
          </CardHeader>
          <CardContent>
            {bidsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Produce</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/kg</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBids.map(bid => {
                    const listing = myListings.find(l => l.id === bid.listing_id);
                    return (
                      <TableRow key={bid.id}>
                        <TableCell>{bid.buyer_name}</TableCell>
                        <TableCell>{listing?.produce_name || '-'}</TableCell>
                        <TableCell>{bid.quantity} kg</TableCell>
                        <TableCell>₹{bid.price_per_unit}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">₹{bid.total_amount.toFixed(2)}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[280px] p-3">
                                  <div className="space-y-2 text-sm">
                                    <p className="font-semibold border-b pb-1">Amount Breakdown</p>
                                    <div className="flex justify-between">
                                      <span>Total Amount:</span>
                                      <span>₹{bid.total_amount.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      GST and platform fees will be calculated at checkout
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBid(bid);
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
        <h2 className="text-xl font-semibold mb-4">All Listings</h2>
        {myListings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>You haven't created any listings yet.</p>
              <Button variant="link" onClick={() => setShowCreateDialog(true)}>
                Create your first listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} showActions userRole="seller" />
            ))}
          </div>
        )}
      </div>

      {/* Delivery Tracking */}
      <DeliveryTrackingList filterByRole="seller" userId={user?.id} />

      <CreateListingDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {selectedBid && (
        <BidManagementDialog
          bid={selectedBid}
          produceName={selectedListing?.produce_name || ''}
          sellerId={user?.id || ''}
          open={!!selectedBid}
          onOpenChange={(open) => !open && setSelectedBid(null)}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
