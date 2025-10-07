import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockListings } from '@/lib/mockData';
import ListingCard from '@/components/ListingCard';
import CreateListingDialog from '@/components/CreateListingDialog';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const myListings = mockListings.filter(l => l.sellerId === user?.id);
  const activeListings = myListings.filter(l => l.status === 'active');
  const pendingListings = myListings.filter(l => l.status === 'pending');

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{activeListings.length}</CardTitle>
            <CardDescription>Active Listings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{pendingListings.length}</CardTitle>
            <CardDescription>Pending Approval</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{myListings.length}</CardTitle>
            <CardDescription>Total Listings</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Listings</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} showActions userRole="seller" />
          ))}
        </div>
      </div>

      <CreateListingDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
};

export default SellerDashboard;
