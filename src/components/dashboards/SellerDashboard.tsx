import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockListings, mockBids } from '@/lib/mockData';
import ListingCard from '@/components/ListingCard';
import CreateListingDialog from '@/components/CreateListingDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BidManagementDialog from '@/components/BidManagementDialog';
import { Bid } from '@/types/produce';
import DeliveryTrackingList from '@/components/DeliveryTrackingList';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [selectedProduceName, setSelectedProduceName] = useState('');
  
  const myListings = mockListings.filter(l => l.sellerId === user?.id);
  const activeCount = myListings.filter(l => l.status === 'active').length;
  const expiredCount = myListings.filter(l => l.status === 'expired').length;
  
  // Get all bids for my listings
  const myListingIds = myListings.map(l => l.id);
  const myBids = mockBids.filter(b => myListingIds.includes(b.listingId));
  const pendingBids = myBids.filter(b => b.status === 'pending');

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
                  const listing = myListings.find(l => l.id === bid.listingId);
                  return (
                    <TableRow key={bid.id}>
                      <TableCell>{bid.buyerName}</TableCell>
                      <TableCell>{listing?.produceName}</TableCell>
                      <TableCell>{bid.quantity} kg</TableCell>
                      <TableCell>₹{bid.pricePerUnit}</TableCell>
                      <TableCell>₹{(bid.quantity * bid.pricePerUnit).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedBid(bid);
                            setSelectedProduceName(listing?.produceName || '');
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
        <h2 className="text-xl font-semibold mb-4">All Listings</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} showActions userRole="seller" />
          ))}
        </div>
      </div>

      {/* Delivery Tracking */}
      <DeliveryTrackingList filterByRole="seller" userId={user?.id} />

      <CreateListingDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      
      {selectedBid && (
        <BidManagementDialog
          bid={selectedBid}
          produceName={selectedProduceName}
          sellerId={user?.id || ''}
          open={!!selectedBid}
          onOpenChange={(open) => !open && setSelectedBid(null)}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
