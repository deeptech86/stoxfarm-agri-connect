import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { useProduce } from '@/hooks/useProduce';
import { Loader2, Leaf, ArrowLeft, CheckCircle2 } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import { MultiValue } from 'react-select';

interface ProduceOption {
  value: string;
  label: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as 'seller' | 'buyer' | 'logistics' | '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [selectedProduce, setSelectedProduce] = useState<ProduceOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch produce list for dropdowns
  const { data: produceData } = useProduce(1, 100, undefined, true);
  const produceOptions: ProduceOption[] = (produceData?.items || []).map(p => ({
    value: p.name,
    label: p.name,
  }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role as 'seller' | 'buyer' | 'logistics',
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        preferred_produce: selectedProduce.map(p => p.value),
      });

      setRegistrationSuccess(true);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Registration Failed',
        description: err.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProduceChange = (newValue: MultiValue<ProduceOption>) => {
    // Limit to 5 selections
    if (newValue.length <= 5) {
      setSelectedProduce(newValue as ProduceOption[]);
    } else {
      toast({
        title: 'Maximum 5 items',
        description: 'You can select up to 5 produce items.',
        variant: 'destructive',
      });
    }
  };

  // Custom styles for react-select to match shadcn/ui
  const selectStyles = {
    control: (base: Record<string, unknown>) => ({
      ...base,
      minHeight: '40px',
      borderColor: 'hsl(var(--border))',
      backgroundColor: 'hsl(var(--background))',
      '&:hover': {
        borderColor: 'hsl(var(--ring))',
      },
    }),
    menu: (base: Record<string, unknown>) => ({
      ...base,
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      zIndex: 50,
    }),
    option: (base: Record<string, unknown>, state: { isFocused: boolean; isSelected: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'hsl(var(--primary))'
        : state.isFocused
        ? 'hsl(var(--accent))'
        : 'transparent',
      color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
      '&:active': {
        backgroundColor: 'hsl(var(--accent))',
      },
    }),
    multiValue: (base: Record<string, unknown>) => ({
      ...base,
      backgroundColor: 'hsl(var(--secondary))',
    }),
    multiValueLabel: (base: Record<string, unknown>) => ({
      ...base,
      color: 'hsl(var(--secondary-foreground))',
    }),
    multiValueRemove: (base: Record<string, unknown>) => ({
      ...base,
      color: 'hsl(var(--secondary-foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'white',
      },
    }),
    input: (base: Record<string, unknown>) => ({
      ...base,
      color: 'hsl(var(--foreground))',
    }),
    placeholder: (base: Record<string, unknown>) => ({
      ...base,
      color: 'hsl(var(--muted-foreground))',
    }),
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your account has been created. An administrator will review and activate your account shortly.
              You will receive an email notification once your account is active.
            </p>
            <div className="bg-muted p-4 rounded-lg text-left mb-6">
              <p className="text-sm"><strong>Name:</strong> {formData.name}</p>
              <p className="text-sm"><strong>Email:</strong> {formData.email}</p>
              <p className="text-sm"><strong>Role:</strong> {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</p>
            </div>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Leaf className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">StoxxFarm</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Register to join the StoxxFarm marketplace
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                    disabled={isSubmitting}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Role and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, role: value as typeof prev.role }));
                      setSelectedProduce([]); // Reset produce selection on role change
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seller">Seller (Farmer)</SelectItem>
                      <SelectItem value="buyer">Buyer (Restaurant/Business)</SelectItem>
                      <SelectItem value="logistics">Logistics Partner</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your full address"
                  rows={2}
                  disabled={isSubmitting}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>

              {/* City and Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter your city"
                    disabled={isSubmitting}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    disabled={isSubmitting}
                  />
                  {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
                </div>
              </div>

              {/* Produce Selection - Only for Sellers and Buyers */}
              {(formData.role === 'seller' || formData.role === 'buyer') && (
                <div className="space-y-2">
                  <Label>
                    {formData.role === 'seller' ? 'I would like to sell (up to 5)' : 'Most frequent buys (up to 5)'}
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    <CreatableSelect
                      isMulti
                      options={produceOptions}
                      value={selectedProduce}
                      onChange={handleProduceChange}
                      placeholder={formData.role === 'seller' ? 'Select or add produce you want to sell...' : 'Select or add produce you frequently buy...'}
                      isDisabled={isSubmitting}
                      styles={selectStyles}
                      formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                      noOptionsMessage={() => 'Type to add new produce'}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select from existing options or type to add new produce items
                  </p>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  By registering, you agree to our terms of service. Your account will be reviewed by an administrator before activation.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
                </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
