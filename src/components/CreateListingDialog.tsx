import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProduceList, useCreateListing } from '@/hooks/useListings';
import { Camera, Video, Loader2 } from 'lucide-react';

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateListingDialog = ({ open, onOpenChange }: CreateListingDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: produceList, isLoading: produceLoading } = useProduceList();
  const createListingMutation = useCreateListing();

  const [selectedProduceId, setSelectedProduceId] = useState('');
  const [itemRate, setItemRate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minOrderQty, setMinOrderQty] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');

  const selectedProduceData = produceList?.find(p => p.id === selectedProduceId);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedProduceData) return;

    try {
      await createListingMutation.mutateAsync({
        produce_id: selectedProduceId,
        produce_name: selectedProduceData.name,
        mandi_rate: selectedProduceData.mandi_rate,
        item_rate: parseFloat(itemRate),
        quantity: parseInt(quantity),
        min_order_qty: parseInt(minOrderQty),
        description: description || undefined,
        video_url: videoPreview || undefined,
      });

      toast({
        title: 'Listing Created',
        description: 'Your listing is now live and expires in 7 days!',
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setSelectedProduceId('');
    setItemRate('');
    setQuantity('');
    setMinOrderQty('');
    setDescription('');
    setVideoFile(null);
    setVideoPreview('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
          <DialogDescription>
            List your produce for sale. Listing will expire automatically after 7 days.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <div className="space-y-2">
            <Label htmlFor="produce">Produce Type</Label>
            <Select value={selectedProduceId} onValueChange={setSelectedProduceId} required>
              <SelectTrigger id="produce" data-testid="produce-select">
                <SelectValue placeholder={produceLoading ? 'Loading...' : 'Select produce'} />
              </SelectTrigger>
              <SelectContent>
                {produceList?.filter(p => p.is_active).map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduceData && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold">Current Mandi Rate (Reference)</p>
              <p className="text-2xl font-bold text-primary">₹{selectedProduceData.mandi_rate}/{selectedProduceData.unit}</p>
              <p className="text-xs text-muted-foreground mt-1">Use this as a guide when setting your price</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="itemRate">Your Price (₹ per {selectedProduceData?.unit || 'kg'})</Label>
            <Input
              id="itemRate"
              data-testid="item-rate-input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter your desired selling price"
              value={itemRate}
              onChange={(e) => setItemRate(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This is the price buyers will see and use for bidding
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Total Quantity (kg)</Label>
            <Input
              id="quantity"
              data-testid="quantity-input"
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
              data-testid="min-order-input"
              type="number"
              min="1"
              placeholder="Enter minimum order quantity"
              value={minOrderQty}
              onChange={(e) => setMinOrderQty(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              data-testid="description-input"
              placeholder="Add details about your produce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Product Photo</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload photo</p>
              <p className="text-xs text-muted-foreground">(Photo upload coming soon)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Product Video (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-6">
              {videoPreview ? (
                <div className="space-y-2">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg max-h-48"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview('');
                    }}
                  >
                    Remove Video
                  </Button>
                </div>
              ) : (
                <label htmlFor="video" className="cursor-pointer block text-center">
                  <Video className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload video</p>
                  <p className="text-xs text-muted-foreground">MP4, WebM, or OGG (max 50MB)</p>
                  <Input
                    id="video"
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          </div>

          <DialogFooter className="pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createListingMutation.isPending} data-testid="create-listing-btn">
              {createListingMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListingDialog;
