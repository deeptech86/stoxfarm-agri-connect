import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAdminAllListings, useAdminCreateListing, useDeleteListing, useProduceList } from '@/hooks/useListings';
import { useUsers } from '@/hooks/useUsers';
import { ListingResponse, CreateListingRequest } from '@/services/listing.service';
import { Plus, Trash2, Search, Loader2, ShoppingCart, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ListingManagement = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<ListingResponse | null>(null);
  const [viewListing, setViewListing] = useState<ListingResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateListingRequest & { seller_id: string }>({
    seller_id: '',
    produce_id: '',
    produce_name: '',
    mandi_rate: 0,
    item_rate: 0,
    quantity: 0,
    min_order_qty: 1,
    video_url: '',
  });

  // Fetch data from API
  const { data: listingsData, isLoading, refetch } = useAdminAllListings(
    1,
    100,
    statusFilter === 'all' ? undefined : statusFilter
  );
  const { data: produceList } = useProduceList();
  const { data: usersData } = useUsers(1, 100, 'seller', true);
  const adminCreateListingMutation = useAdminCreateListing();
  const deleteListingMutation = useDeleteListing();

  const listings = listingsData?.items || [];
  const sellers = usersData?.items || [];

  // Filter listings by search query
  const filteredListings = listings.filter(l => {
    const matchesSearch = !searchQuery ||
      l.produce_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.seller_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'expired': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const handleDelete = (listing: ListingResponse) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (listingToDelete) {
      try {
        await deleteListingMutation.mutateAsync(listingToDelete.id);
        toast({
          title: 'Listing cancelled',
          description: `Listing for ${listingToDelete.produce_name} has been cancelled.`,
        });
        setDeleteDialogOpen(false);
        setListingToDelete(null);
        refetch();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to cancel listing.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCreateNew = () => {
    setFormData({
      seller_id: '',
      produce_id: '',
      produce_name: '',
      mandi_rate: 0,
      item_rate: 0,
      quantity: 0,
      min_order_qty: 1,
      video_url: '',
    });
    setIsFormOpen(true);
  };

  const handleProduceChange = (produceId: string) => {
    const selectedProduce = produceList?.find(p => p.id === produceId);
    if (selectedProduce) {
      const mandiRate = parseFloat(selectedProduce.mandi_rate as unknown as string) || 0;
      setFormData({
        ...formData,
        produce_id: produceId,
        produce_name: selectedProduce.name,
        mandi_rate: mandiRate,
        item_rate: mandiRate, // Default to mandi rate, admin can adjust
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const { seller_id, ...listingData } = formData;
      await adminCreateListingMutation.mutateAsync({
        sellerId: seller_id,
        data: listingData,
      });
      toast({
        title: 'Listing created',
        description: `Listing for ${formData.produce_name} has been created.`,
      });
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create listing.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <div>
              <CardTitle>Listing Management</CardTitle>
              <CardDescription>Create and manage marketplace listings</CardDescription>
            </div>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Listing
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by produce or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produce</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Seller's Price</TableHead>
                <TableHead>Mandi Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No listings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredListings.map(listing => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.produce_name}</TableCell>
                    <TableCell>{listing.seller_name || 'Unknown'}</TableCell>
                    <TableCell>{listing.available_quantity} / {listing.quantity} kg</TableCell>
                    <TableCell className="font-semibold text-primary">₹{parseFloat(String(listing.item_rate)).toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">₹{parseFloat(String(listing.mandi_rate)).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(listing.status)}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(listing.expires_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewListing(listing)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {listing.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(listing)}
                            title="Cancel listing"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredListings.length} of {listingsData?.total || 0} listings
        </div>
      </CardContent>

      {/* Create Listing Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Listing</DialogTitle>
            <DialogDescription>
              Create a listing on behalf of a seller.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="seller">Seller *</Label>
              <Select value={formData.seller_id} onValueChange={(v) => setFormData({ ...formData, seller_id: v })}>
                <SelectTrigger id="seller">
                  <SelectValue placeholder="Select a seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map(seller => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name} ({seller.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="produce">Produce *</Label>
              <Select value={formData.produce_id} onValueChange={handleProduceChange}>
                <SelectTrigger id="produce">
                  <SelectValue placeholder="Select produce" />
                </SelectTrigger>
                <SelectContent>
                  {produceList?.filter(p => p.is_active).map(produce => (
                    <SelectItem key={produce.id} value={produce.id}>
                      {produce.name} (₹{parseFloat(produce.mandi_rate as unknown as string).toFixed(2)}/{produce.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity (kg) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="min_order_qty">Min Order Qty (kg) *</Label>
                <Input
                  id="min_order_qty"
                  type="number"
                  step="0.01"
                  value={formData.min_order_qty || ''}
                  onChange={(e) => setFormData({ ...formData, min_order_qty: parseFloat(e.target.value) || 0 })}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mandi_rate">Mandi Rate (₹/kg) - Reference</Label>
              <Input
                id="mandi_rate"
                type="number"
                step="0.01"
                value={formData.mandi_rate || ''}
                onChange={(e) => setFormData({ ...formData, mandi_rate: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Auto-filled from produce selection (reference only).
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item_rate">Seller's Price (₹/kg) *</Label>
              <Input
                id="item_rate"
                type="number"
                step="0.01"
                value={formData.item_rate || ''}
                onChange={(e) => setFormData({ ...formData, item_rate: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                The price at which the seller wants to sell. Used for transactions.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="video_url">Video URL (optional)</Label>
              <Input
                id="video_url"
                value={formData.video_url || ''}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.seller_id ||
                !formData.produce_id ||
                !formData.quantity ||
                !formData.min_order_qty ||
                !formData.item_rate ||
                adminCreateListingMutation.isPending
              }
            >
              {adminCreateListingMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Listing Dialog */}
      <Dialog open={!!viewListing} onOpenChange={() => setViewListing(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Listing Details</DialogTitle>
          </DialogHeader>
          {viewListing && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Produce</Label>
                  <p className="font-medium">{viewListing.produce_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>
                    <Badge variant={getStatusBadgeVariant(viewListing.status)}>
                      {viewListing.status.charAt(0).toUpperCase() + viewListing.status.slice(1)}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Seller</Label>
                  <p className="font-medium">{viewListing.seller_name || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Seller's Price</Label>
                  <p className="font-medium text-primary">₹{parseFloat(String(viewListing.item_rate)).toFixed(2)}/kg</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mandi Rate (Reference)</Label>
                  <p className="font-medium text-muted-foreground">₹{parseFloat(String(viewListing.mandi_rate)).toFixed(2)}/kg</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Value</Label>
                  <p className="font-medium">₹{(parseFloat(String(viewListing.item_rate)) * parseFloat(String(viewListing.quantity))).toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Total Quantity</Label>
                  <p className="font-medium">{viewListing.quantity} kg</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Available</Label>
                  <p className="font-medium">{viewListing.available_quantity} kg</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Min Order</Label>
                  <p className="font-medium">{viewListing.min_order_qty} kg</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Views</Label>
                  <p className="font-medium">{viewListing.view_count}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="font-medium">{format(new Date(viewListing.created_at), 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expires</Label>
                  <p className="font-medium">{format(new Date(viewListing.expires_at), 'MMM d, yyyy HH:mm')}</p>
                </div>
              </div>
              {viewListing.video_url && (
                <div>
                  <Label className="text-muted-foreground">Video</Label>
                  <a href={viewListing.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Video
                  </a>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewListing(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the listing for {listingToDelete?.produce_name}. All pending bids will be rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Listing</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ListingManagement;
