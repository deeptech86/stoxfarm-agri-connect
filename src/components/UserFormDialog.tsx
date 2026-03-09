import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserRole } from '@/types/user';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import { UserResponse, CreateUserRequest, UpdateUserRequest } from '@/services/user.service';
import { useSatelliteCenters } from '@/hooks/useSatelliteCenters';
import { useProduce } from '@/hooks/useProduce';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import { MultiValue } from 'react-select';

interface ProduceOption {
  value: string;
  label: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserResponse | null;
  onSave: () => void;
}

const UserFormDialog = ({ open, onOpenChange, user, onSave }: UserFormDialogProps) => {
  const { toast } = useToast();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const { data: satelliteCentersData } = useSatelliteCenters(1, 100, undefined, undefined, true);
  const satelliteCenters = satelliteCentersData?.items || [];
  const { data: produceData } = useProduce(1, 100, undefined, true);
  const produceOptions: ProduceOption[] = (produceData?.items || []).map(p => ({
    value: p.name,
    label: p.name,
  }));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'buyer' as UserRole,
    address: '',
    city: '',
    pincode: '',
    notes: '',
    satelliteCenterId: '',
  });
  const [selectedProduce, setSelectedProduce] = useState<ProduceOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email || '',
        password: '',
        phone: user.phone,
        role: user.role,
        address: user.address,
        city: (user as unknown as { city?: string }).city || '',
        pincode: (user as unknown as { pincode?: string }).pincode || '',
        notes: user.notes || '',
        satelliteCenterId: user.satellite_center_id || '',
      });
      // Load existing preferred_produce if available
      const userProduce = (user as unknown as { preferred_produce?: string[] }).preferred_produce;
      if (userProduce && Array.isArray(userProduce)) {
        setSelectedProduce(userProduce.map(p => ({ value: p, label: p })));
      } else {
        setSelectedProduce([]);
      }
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'buyer',
        address: '',
        city: '',
        pincode: '',
        notes: '',
        satelliteCenterId: '',
      });
      setSelectedProduce([]);
    }
    setErrors({});
  }, [user, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password is required for new users';
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Only include satellite_center_id if it's a valid UUID (36 chars with dashes)
      const satelliteId = formData.satelliteCenterId.trim();
      const isValidUUID = satelliteId.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(satelliteId);
      const produceValues = selectedProduce.map(p => p.value);

      if (user) {
        const updateData: UpdateUserRequest = {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim() || undefined,
          pincode: formData.pincode.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          satellite_center_id: isValidUUID ? satelliteId : undefined,
          password: formData.password.trim() || undefined,
          preferred_produce: produceValues.length > 0 ? produceValues : undefined,
        };
        await updateUserMutation.mutateAsync({ id: user.id, data: updateData });
        toast({
          title: 'User updated',
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        const createData: CreateUserRequest = {
          email: formData.email.trim(),
          password: formData.password.trim(),
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          address: formData.address.trim(),
          city: formData.city.trim() || undefined,
          pincode: formData.pincode.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          satellite_center_id: isValidUUID ? satelliteId : undefined,
          preferred_produce: produceValues.length > 0 ? produceValues : undefined,
        };
        await createUserMutation.mutateAsync(createData);
        toast({
          title: 'User created',
          description: `${formData.name} has been created successfully.`,
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: user ? 'Failed to update user.' : 'Failed to create user.',
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending;
  const showSatelliteFields = ['seller', 'buyer', 'logistics'].includes(formData.role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                data-testid="user-name-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                data-testid="user-email-input"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                disabled={!!user}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? 'New Password (leave blank to keep current)' : 'Password *'}
            </Label>
            <Input
              id="password"
              type="password"
              data-testid="user-password-input"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder={user ? 'Enter new password to change' : 'Enter password'}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
                disabled={!!user}
              >
                <SelectTrigger id="role" data-testid="user-role-select">
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
                data-testid="user-phone-input"
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
              data-testid="user-address-input"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter full address"
              rows={2}
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
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
              />
            </div>
          </div>

          {(formData.role === 'seller' || formData.role === 'buyer') && (
            <div className="space-y-2">
              <Label>
                {formData.role === 'seller' ? 'Preferred Produce to Sell (up to 5)' : 'Most Frequent Buys (up to 5)'}
              </Label>
              <CreatableSelect
                isMulti
                options={produceOptions}
                value={selectedProduce}
                onChange={(newValue: MultiValue<ProduceOption>) => {
                  if (newValue.length <= 5) {
                    setSelectedProduce(newValue as ProduceOption[]);
                  } else {
                    toast({
                      title: 'Maximum 5 items',
                      description: 'You can select up to 5 produce items.',
                      variant: 'destructive',
                    });
                  }
                }}
                placeholder={formData.role === 'seller' ? 'Select or add produce to sell...' : 'Select or add produce they buy...'}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '40px',
                    borderColor: 'hsl(var(--border))',
                    backgroundColor: 'hsl(var(--background))',
                    '&:hover': {
                      borderColor: 'hsl(var(--ring))',
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    zIndex: 50,
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? 'hsl(var(--primary))'
                      : state.isFocused
                      ? 'hsl(var(--accent))'
                      : 'transparent',
                    color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: 'hsl(var(--secondary))',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'hsl(var(--secondary-foreground))',
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: 'hsl(var(--secondary-foreground))',
                    '&:hover': {
                      backgroundColor: 'hsl(var(--destructive))',
                      color: 'white',
                    },
                  }),
                  input: (base) => ({
                    ...base,
                    color: 'hsl(var(--foreground))',
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: 'hsl(var(--muted-foreground))',
                  }),
                }}
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                noOptionsMessage={() => 'Type to add new produce'}
              />
              <p className="text-xs text-muted-foreground">
                Select from existing options or type to add new produce items
              </p>
            </div>
          )}

          {showSatelliteFields && (
            <div className="space-y-2">
              <Label htmlFor="satelliteCenterId">Satellite Center</Label>
              <Select
                value={formData.satelliteCenterId || "none"}
                onValueChange={(value) => setFormData(prev => ({ ...prev, satelliteCenterId: value === "none" ? "" : value }))}
              >
                <SelectTrigger id="satelliteCenterId">
                  <SelectValue placeholder="Select satellite center (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {satelliteCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name} - {center.city || center.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="save-user-btn">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {user ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{user ? 'Update' : 'Create'} User</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
