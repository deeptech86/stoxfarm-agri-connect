import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SatelliteCenter } from '@/types/satellite';
import { addSatelliteCenter, updateSatelliteCenter } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface SatelliteCenterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  center?: SatelliteCenter | null;
  onSave: () => void;
}

const SatelliteCenterFormDialog = ({ open, onOpenChange, center, onSave }: SatelliteCenterFormDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    officePhone: '',
    platformFee: 2.5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (center) {
      setFormData({
        name: center.name,
        address: center.address,
        officePhone: center.officePhone,
        platformFee: center.platformFee,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        officePhone: '',
        platformFee: 2.5,
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
    if (!formData.officePhone.trim()) {
      newErrors.officePhone = 'Office phone is required';
    }
    if (formData.platformFee < 0 || formData.platformFee > 100) {
      newErrors.platformFee = 'Platform fee must be between 0 and 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const centerData: SatelliteCenter = {
      id: center?.id || `sc-${Date.now()}`,
      name: formData.name.trim(),
      address: formData.address.trim(),
      officePhone: formData.officePhone.trim(),
      platformFee: formData.platformFee,
      createdAt: center?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (center) {
      updateSatelliteCenter(center.id, centerData);
      toast({
        title: 'Center updated',
        description: `${centerData.name} has been updated successfully.`,
      });
    } else {
      addSatelliteCenter(centerData);
      toast({
        title: 'Center created',
        description: `${centerData.name} has been created successfully.`,
      });
    }

    onSave();
    onOpenChange(false);
  };

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

          <div className="space-y-2">
            <Label htmlFor="centerId">Center ID</Label>
            <Input
              id="centerId"
              value={center?.id || 'Auto-generated'}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Center ID is automatically generated</p>
          </div>

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
              <Label htmlFor="officePhone">Office Phone *</Label>
              <Input
                id="officePhone"
                value={formData.officePhone}
                onChange={(e) => setFormData(prev => ({ ...prev, officePhone: e.target.value }))}
                placeholder="+91 XX XXXX XXXX"
              />
              {errors.officePhone && <p className="text-sm text-destructive">{errors.officePhone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="platformFee">Platform Fee (%) *</Label>
              <Input
                id="platformFee"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.platformFee}
                onChange={(e) => setFormData(prev => ({ ...prev, platformFee: parseFloat(e.target.value) || 0 }))}
                placeholder="2.5"
              />
              {errors.platformFee && <p className="text-sm text-destructive">{errors.platformFee}</p>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {center ? 'Update' : 'Create'} Center
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SatelliteCenterFormDialog;
