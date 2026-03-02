import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/types/produce';
import { UserRole } from '@/types/user';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import ListingDetailsDialog from './ListingDetailsDialog';
import PlaceBidDialog from './PlaceBidDialog';

interface ListingCardProps {
  listing: Listing;
  showActions: boolean;
  userRole: UserRole;
}

const ListingCard = ({ listing, showActions, userRole }: ListingCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showBidDialog, setShowBidDialog] = useState(false);

  // Check if listing is expired
  const isExpired = new Date() > new Date(listing.expires_at);
  const displayStatus = isExpired ? 'expired' : listing.status;

  const getStatusColor = () => {
    switch (displayStatus) {
      case 'active': return 'bg-success/10 text-success';
      case 'expired': return 'bg-muted text-muted-foreground';
      case 'sold_out': return 'bg-warning/10 text-warning';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return '';
    }
  };

  // Get primary image or first image
  const primaryImage = listing.images.find(img => img.is_primary)?.image_url
    || listing.images[0]?.image_url
    || '/placeholder-produce.jpg';

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid="listing-card">
        <div className="aspect-video relative overflow-hidden bg-muted">
          <img
            src={primaryImage}
            alt={listing.produce_name}
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-2 right-2 ${getStatusColor()}`}>
            {displayStatus}
          </Badge>
        </div>
        <CardHeader>
          <CardTitle>{listing.produce_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Seller's Price:</span>
            <span className="font-semibold text-primary">₹{listing.item_rate}/kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mandi Rate:</span>
            <span className="font-semibold text-muted-foreground">₹{listing.mandi_rate}/kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available:</span>
            <span className="font-semibold">{listing.available_quantity} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Min Order:</span>
            <span className="font-semibold">{listing.min_order_qty} kg</span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)} className="flex-1" data-testid="listing-details-btn">
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
          {userRole === 'buyer' && displayStatus === 'active' && (
            <Button size="sm" onClick={() => setShowBidDialog(true)} className="flex-1" data-testid="place-bid-btn">
              Place Bid
            </Button>
          )}
        </CardFooter>
      </Card>

      <ListingDetailsDialog
        listing={listing}
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
