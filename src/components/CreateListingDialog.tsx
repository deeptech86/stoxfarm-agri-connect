import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { produceList, addListing } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateListingDialog = ({ open, onOpenChange }: CreateListingDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProduce, setSelectedProduce] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minOrderQty, setMinOrderQty] = useState('');

  const selectedProduceData = produceList.find(p => p.name === selectedProduce);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedProduceData) return;

    const newListing = {
      id: `list-${Date.now()}`,
      sellerId: user.id,
      produceName: selectedProduce,
      mandiRate: selectedProduceData.mandiRate,
      quantity: parseInt(quantity),
      minOrderQty: parseInt(minOrderQty),
      images: ['https://images.unsplash.com/photo-1542838132-92c53300491e'],
      status: 'active' as const,
      createdAt: new Date(),
      expiresAt: new Date(), // Will be set to +7 days by addListing
    };

    addListing(newListing);
    
    toast({
      title: 'Listing Created',
      description: 'Your listing is now live and expires in 7 days!',
    });

    onOpenChange(false);
    setSelectedProduce('');
    setQuantity('');
    setMinOrderQty('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
          <DialogDescription>
            List your produce for sale. Listing will expire automatically after 7 days.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="produce">Produce Type</Label>
            <Select value={selectedProduce} onValueChange={setSelectedProduce} required>
              <SelectTrigger id="produce">
                <SelectValue placeholder="Select produce" />
              </SelectTrigger>
              <SelectContent>
                {produceList.map(p => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduceData && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold">Current Mandi Rate</p>
              <p className="text-2xl font-bold text-primary">₹{selectedProduceData.mandiRate}/kg</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Total Quantity (kg)</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter total quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minOrderQty">Minimum Order Quantity (kg)</Label>
            <Input
              id="minOrderQty"
              type="number"
              min="1"
              placeholder="Enter minimum order quantity"
              value={minOrderQty}
              onChange={(e) => setMinOrderQty(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Product Photo</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload photo</p>
              <p className="text-xs text-muted-foreground">(Demo: default image will be used)</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Listing</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListingDialog;
