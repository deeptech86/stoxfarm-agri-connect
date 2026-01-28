import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SatelliteCenterResponse, CreateSatelliteCenterRequest, UpdateSatelliteCenterRequest } from '@/services/satellite-center.service';
import { useCreateSatelliteCenter, useUpdateSatelliteCenter } from '@/hooks/useSatelliteCenters';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SatelliteCenterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  center?: SatelliteCenterResponse | null;
  onSave: () => void;
}

const SatelliteCenterFormDialog = ({ open, onOpenChange, center, onSave }: SatelliteCenterFormDialogProps) => {
  const { toast } = useToast();
  const createCenterMutation = useCreateSatelliteCenter();
  const updateCenterMutation = useUpdateSatelliteCenter();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    office_phone: '',
    platform_fee: '2.5',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (center) {
      setFormData({
        name: center.name,
        address: center.address,
        office_phone: center.office_phone,
        platform_fee: center.platform_fee,
        city: center.city || '',
        state: center.state || '',
        pincode: center.pincode || '',
      });
    } else {
      setFormData({
        name: '',
        address: '',
        office_phone: '',
        platform_fee: '2.5',
        city: '',
        state: '',
        pincode: '',
      });
    }
    setErrors({});
  }, [center, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Center name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.office_phone.trim()) {
      newErrors.office_phone = 'Office phone is required';
    }
    const fee = parseFloat(formData.platform_fee);
    if (isNaN(fee) || fee < 0 || fee > 100) {
      newErrors.platform_fee = 'Platform fee must be between 0 and 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (center) {
        const updateData: UpdateSatelliteCenterRequest = {
          name: formData.name.trim(),
          address: formData.address.trim(),
          office_phone: formData.office_phone.trim(),
          platform_fee: formData.platform_fee,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          pincode: formData.pincode.trim() || undefined,
        };
        await updateCenterMutation.mutateAsync({ id: center.id, data: updateData });
        toast({
          title: 'Center updated',
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        const createData: CreateSatelliteCenterRequest = {
          name: formData.name.trim(),
          address: formData.address.trim(),
          office_phone: formData.office_phone.trim(),
          platform_fee: formData.platform_fee,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          pincode: formData.pincode.trim() || undefined,
        };
        await createCenterMutation.mutateAsync(createData);
        toast({
          title: 'Center created',
          description: `${formData.name} has been created successfully.`,
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: center ? 'Failed to update satellite center.' : 'Failed to create satellite center.',
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = createCenterMutation.isPending || updateCenterMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{center ? 'Edit Satellite Center' : 'Create New Satellite Center'}</DialogTitle>
          <DialogDescription>
            {center ? 'Update satellite center information' : 'Add a new satellite center to the platform'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Center Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter center name"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {center && (
            <div className="space-y-2">
              <Label htmlFor="centerId">Center ID</Label>
              <Input
                id="centerId"
                value={center.id}
                disabled
                className="bg-muted font-mono text-sm"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter full address"
              rows={3}
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Enter state"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="Enter pincode"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="office_phone">Office Phone *</Label>
              <Input
                id="office_phone"
                value={formData.office_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, office_phone: e.target.value }))}
                placeholder="+91 XX XXXX XXXX"
              />
              {errors.office_phone && <p className="text-sm text-destructive">{errors.office_phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform_fee">Platform Fee (%) *</Label>
            <Input
              id="platform_fee"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.platform_fee}
              onChange={(e) => setFormData(prev => ({ ...prev, platform_fee: e.target.value }))}
              placeholder="2.5"
            />
            {errors.platform_fee && <p className="text-sm text-destructive">{errors.platform_fee}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {center ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{center ? 'Update' : 'Create'} Center</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SatelliteCenterFormDialog;
