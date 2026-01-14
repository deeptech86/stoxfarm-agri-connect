import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, UserRole } from '@/types/user';
import { produceList, addUser, updateUser } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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
    cropsSupported: [] as string[],
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
        cropsSupported: user.cropsSupported || [],
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'buyer',
        address: '',
        notes: '',
        cropsSupported: [],
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
      password: user?.password || 'password123', // Default password for new users
      phone: formData.phone.trim(),
      role: formData.role,
      address: formData.address.trim(),
      notes: formData.notes.trim(),
      cropsSupported: formData.role === 'seller' ? formData.cropsSupported : undefined,
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

  const addCrop = (crop: string) => {
    if (!formData.cropsSupported.includes(crop)) {
      setFormData(prev => ({
        ...prev,
        cropsSupported: [...prev.cropsSupported, crop],
      }));
    }
  };

  const removeCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      cropsSupported: prev.cropsSupported.filter(c => c !== crop),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user information' : 'Add a new user to the platform'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          {formData.role === 'seller' && (
            <div className="space-y-2">
              <Label>Crops Supported</Label>
              <Select onValueChange={addCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Add crops" />
                </SelectTrigger>
                <SelectContent>
                  {produceList.map(p => (
                    <SelectItem 
                      key={p.id} 
                      value={p.name}
                      disabled={formData.cropsSupported.includes(p.name)}
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formData.cropsSupported.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.cropsSupported.map(crop => (
                    <Badge key={crop} variant="secondary" className="gap-1">
                      {crop}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeCrop(crop)}
                      />
                    </Badge>
                  ))}
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
