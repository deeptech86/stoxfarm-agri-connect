import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/types/produce';
import { UserRole } from '@/types/user';
import { Check, X, Eye } from 'lucide-react';
import { updateListingStatus, mockUsers, addTransaction } from '@/lib/mockData';
import { useNotifications } from '@/contexts/NotificationContext';
import { useState } from 'react';
import ListingDetailsDialog from './ListingDetailsDialog';
import PlaceBidDialog from './PlaceBidDialog';

interface ListingCardProps {
  listing: Listing;
  showActions: boolean;
  userRole: UserRole;
}

const ListingCard = ({ listing, showActions, userRole }: ListingCardProps) => {
  const { addNotification } = useNotifications();
  const [showDetails, setShowDetails] = useState(false);
  const [showBidDialog, setShowBidDialog] = useState(false);
  const seller = mockUsers.find(u => u.id === listing.sellerId);

  const handleApprove = () => {
    updateListingStatus(listing.id, 'active');
    addNotification(listing.sellerId, `Your listing for ${listing.produceName} has been approved and is now live!`, 'success');
  };

  const handleReject = () => {
    updateListingStatus(listing.id, 'rejected');
    addNotification(listing.sellerId, `Your listing for ${listing.produceName} has been rejected. Please review and resubmit.`, 'warning');
  };

  const getStatusColor = () => {
    switch (listing.status) {
      case 'active': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      case 'expired': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden bg-muted">
          <img 
            src={listing.images[0]} 
            alt={listing.produceName}
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-2 right-2 ${getStatusColor()}`}>
            {listing.status}
          </Badge>
        </div>
        <CardHeader>
          <CardTitle>{listing.produceName}</CardTitle>
          <CardDescription>
            Seller: {seller?.name || 'Unknown'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mandi Rate:</span>
            <span className="font-semibold">₹{listing.mandiRate}/kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Quantity:</span>
            <span className="font-semibold">{listing.quantity} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Min Order:</span>
            <span className="font-semibold">{listing.minOrderQty} kg</span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
          {showActions && userRole === 'admin' && listing.status === 'pending' && (
            <>
              <Button size="sm" onClick={handleApprove} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={handleReject}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          {userRole === 'buyer' && listing.status === 'active' && (
            <Button size="sm" onClick={() => setShowBidDialog(true)} className="flex-1">
              Place Bid
            </Button>
          )}
        </CardFooter>
      </Card>

      <ListingDetailsDialog 
        listing={listing} 
        seller={seller} 
        open={showDetails} 
        onOpenChange={setShowDetails}
      />
      
      <PlaceBidDialog 
        listing={listing}
        open={showBidDialog}
        onOpenChange={setShowBidDialog}
      />
    </>
  );
};

export default ListingCard;
