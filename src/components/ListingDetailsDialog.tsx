import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Listing } from '@/types/produce';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Package } from 'lucide-react';

interface ListingDetailsDialogProps {
  listing: Listing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ListingDetailsDialog = ({ listing, open, onOpenChange }: ListingDetailsDialogProps) => {
  const getStatusColor = () => {
    switch (listing.status) {
      case 'active': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      case 'expired': return 'bg-muted text-muted-foreground';
      case 'sold_out': return 'bg-warning/10 text-warning';
      default: return '';
    }
  };

  // Get primary image or first image
  const primaryImage = listing.images.find(img => img.is_primary)?.image_url
    || listing.images[0]?.image_url
    || '/placeholder-produce.jpg';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Listing Details</DialogTitle>
          <DialogDescription>Complete information about this listing</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
            <img
              src={primaryImage}
              alt={listing.produce_name}
              className="w-full h-full object-cover"
            />
            <Badge className={`absolute top-3 right-3 ${getStatusColor()}`}>
              {listing.status}
            </Badge>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">{listing.produce_name}</h3>
            {listing.description && (
              <p className="text-sm text-muted-foreground mb-4">{listing.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Seller's Price</p>
                <p className="text-lg font-semibold text-primary">₹{listing.item_rate}/kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-lg font-semibold">₹{listing.item_rate * listing.quantity}</p>
              </div>
            </div>
            <div className="mt-2 p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">
                Reference Mandi Rate: <span className="font-semibold">₹{listing.mandi_rate}/kg</span>
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Quantity Information
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Quantity</p>
                <p className="font-semibold">{listing.quantity} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="font-semibold">{listing.available_quantity} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">Minimum Order</p>
                <p className="font-semibold">{listing.min_order_qty} kg</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Listed On</p>
                <p className="font-semibold">{formatDate(listing.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expires On</p>
                <p className="font-semibold">{formatDate(listing.expires_at)}</p>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingDetailsDialog;
