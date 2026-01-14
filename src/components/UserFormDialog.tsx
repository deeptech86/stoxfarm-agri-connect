import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, UserRole, CropDetail } from '@/types/user';
import { produceList, addUser, updateUser } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSave: () => void;
}

const UserFormDialog = ({ open, onOpenChange, user, onSave }: UserFormDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'buyer' as UserRole,
    address: '',
    notes: '',
    cropDetails: [] as CropDetail[],
    satelliteCenterName: '',
    satelliteCenterId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        role: user.role,
        address: user.address,
        notes: user.notes || '',
        cropDetails: user.cropDetails || [],
        satelliteCenterName: user.satelliteCenterName || '',
        satelliteCenterId: user.satelliteCenterId || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'buyer',
        address: '',
        notes: '',
        cropDetails: [],
        satelliteCenterName: '',
        satelliteCenterId: '',
      });
    }
    setErrors({});
  }, [user, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const userData: User = {
      id: user?.id || `user-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: user?.password || 'password123',
      phone: formData.phone.trim(),
      role: formData.role,
      address: formData.address.trim(),
      notes: formData.notes.trim(),
      cropDetails: formData.role === 'seller' ? formData.cropDetails : undefined,
      cropsSupported: formData.role === 'seller' ? formData.cropDetails.map(c => c.cropName) : undefined,
      satelliteCenterName: ['seller', 'buyer', 'logistics'].includes(formData.role) ? formData.satelliteCenterName.trim() : undefined,
      satelliteCenterId: ['seller', 'buyer', 'logistics'].includes(formData.role) ? formData.satelliteCenterId.trim() : undefined,
    };

    if (user) {
      updateUser(user.id, userData);
      toast({
        title: 'User updated',
        description: `${userData.name} has been updated successfully.`,
      });
    } else {
      addUser(userData);
      toast({
        title: 'User created',
        description: `${userData.name} has been created successfully.`,
      });
    }

    onSave();
    onOpenChange(false);
  };

  const addCropRow = () => {
    setFormData(prev => ({
      ...prev,
      cropDetails: [...prev.cropDetails, { cropName: '', gst: 0, overallQuantity: 0, minQuantity: 0 }],
    }));
  };

  const removeCropRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cropDetails: prev.cropDetails.filter((_, i) => i !== index),
    }));
  };

  const updateCropRow = (index: number, field: keyof CropDetail, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      cropDetails: prev.cropDetails.map((crop, i) => 
        i === index ? { ...crop, [field]: value } : crop
      ),
    }));
  };

  const showSatelliteFields = ['seller', 'buyer', 'logistics'].includes(formData.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user information' : 'Add a new user to the platform'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter full address"
              rows={2}
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          {/* Satellite Center Fields - for Seller, Buyer, Logistics */}
          {showSatelliteFields && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="satelliteCenterName">Satellite Center Name</Label>
                <Input
                  id="satelliteCenterName"
                  value={formData.satelliteCenterName}
                  onChange={(e) => setFormData(prev => ({ ...prev, satelliteCenterName: e.target.value }))}
                  placeholder="Enter center name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satelliteCenterId">Center ID</Label>
                <Input
                  id="satelliteCenterId"
                  value={formData.satelliteCenterId}
                  onChange={(e) => setFormData(prev => ({ ...prev, satelliteCenterId: e.target.value }))}
                  placeholder="Enter center ID"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          {/* Crop Details Table - Only for Sellers */}
          {formData.role === 'seller' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Crops Supported</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCropRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Crop
                </Button>
              </div>
              
              {formData.cropDetails.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[180px]">Crop Name</TableHead>
                        <TableHead className="w-[100px]">GST (%)</TableHead>
                        <TableHead className="w-[130px]">Overall Qty (kg)</TableHead>
                        <TableHead className="w-[130px]">Min Qty (kg)</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.cropDetails.map((crop, index) => (
                        <TableRow key={index}>
                          <TableCell className="p-2">
                            <Select
                              value={crop.cropName}
                              onValueChange={(value) => updateCropRow(index, 'cropName', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select crop" />
                              </SelectTrigger>
                              <SelectContent>
                                {produceList.map(p => (
                                  <SelectItem 
                                    key={p.id} 
                                    value={p.name}
                                    disabled={formData.cropDetails.some((c, i) => i !== index && c.cropName === p.name)}
                                  >
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={crop.gst}
                              onChange={(e) => updateCropRow(index, 'gst', parseFloat(e.target.value) || 0)}
                              className="h-9"
                              placeholder="GST %"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min="0"
                              value={crop.overallQuantity}
                              onChange={(e) => updateCropRow(index, 'overallQuantity', parseInt(e.target.value) || 0)}
                              className="h-9"
                              placeholder="Quantity"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min="0"
                              value={crop.minQuantity}
                              onChange={(e) => updateCropRow(index, 'minQuantity', parseInt(e.target.value) || 0)}
                              className="h-9"
                              placeholder="Min qty"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeCropRow(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                  No crops added. Click "Add Crop" to add crop details.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {user ? 'Update' : 'Create'} User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
