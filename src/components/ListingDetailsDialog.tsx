import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Listing } from '@/types/produce';
import { User } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Package, ShoppingCart, User as UserIcon, MapPin, Phone } from 'lucide-react';

interface ListingDetailsDialogProps {
  listing: Listing;
  seller?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ListingDetailsDialog = ({ listing, seller, open, onOpenChange }: ListingDetailsDialogProps) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Listing Details</DialogTitle>
          <DialogDescription>Complete information about this listing</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
            <img 
              src={listing.images[0]} 
              alt={listing.produceName}
              className="w-full h-full object-cover"
            />
            <Badge className={`absolute top-3 right-3 ${getStatusColor()}`}>
              {listing.status}
            </Badge>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">{listing.produceName}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mandi Rate</p>
                <p className="text-lg font-semibold text-primary">₹{listing.mandiRate}/kg</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-lg font-semibold">₹{listing.mandiRate * listing.quantity}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Quantity Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Quantity</p>
                <p className="font-semibold">{listing.quantity} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">Minimum Order</p>
                <p className="font-semibold">{listing.minOrderQty} kg</p>
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
                <p className="font-semibold">{listing.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expires On</p>
                <p className="font-semibold">{listing.expiresAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {seller && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Seller Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-semibold">{seller.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold">{seller.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold">{seller.address}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingDetailsDialog;
