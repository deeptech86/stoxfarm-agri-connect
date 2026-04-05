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
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Leaf, ArrowLeft, CheckCircle2, MapPin } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import { MultiValue } from 'react-select';
import LanguageSelector from '@/components/LanguageSelector';

interface ProduceOption {
  value: string;
  label: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
      newErrors.name = t('validation.nameRequired');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }
    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('validation.passwordLength');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
    }
    if (!formData.role) {
      newErrors.role = t('validation.roleRequired');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('validation.phoneRequired');
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = t('validation.phoneInvalid');
    }
    if (!formData.address.trim()) {
      newErrors.address = t('validation.addressRequired');
    }
    if (!formData.city.trim()) {
      newErrors.city = t('validation.cityRequired');
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = t('validation.pincodeRequired');
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = t('validation.pincodeInvalid');
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
        title: t('toast.registrationFailed'),
        description: err.message || t('toast.registrationFailedDesc'),
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
        title: t('toast.maxItems'),
        description: t('toast.maxItemsDesc'),
        variant: 'destructive',
      });
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: t('toast.locationNotSupported'),
        description: t('toast.locationNotSupportedDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use Nominatim (OpenStreetMap) for reverse geocoding - free and no API key required
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch address');
          }

          const data = await response.json();
          const address = data.address;

          // Build the full address string
          const addressParts = [];
          if (address.road) addressParts.push(address.road);
          if (address.neighbourhood) addressParts.push(address.neighbourhood);
          if (address.suburb) addressParts.push(address.suburb);
          if (address.village) addressParts.push(address.village);
          if (address.county) addressParts.push(address.county);
          if (address.state_district) addressParts.push(address.state_district);
          if (address.state) addressParts.push(address.state);

          const fullAddress = addressParts.join(', ');
          const city = address.city || address.town || address.village || address.county || address.state_district || '';
          const pincode = address.postcode || '';

          setFormData(prev => ({
            ...prev,
            address: fullAddress,
            city: city,
            pincode: pincode.replace(/\s/g, '').slice(0, 6), // Clean and limit to 6 digits
          }));

          toast({
            title: t('toast.locationDetected'),
            description: t('toast.locationDetectedDesc'),
          });
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast({
            title: t('toast.locationFetchError'),
            description: t('toast.locationFetchErrorDesc'),
            variant: 'destructive',
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let message = t('toast.locationFetchErrorDesc');
        if (error.code === error.PERMISSION_DENIED) {
          message = t('toast.locationPermissionDenied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = t('toast.locationUnavailable');
        } else if (error.code === error.TIMEOUT) {
          message = t('toast.locationTimeout');
        }
        toast({
          title: t('toast.locationError'),
          description: message,
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
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
            <h2 className="text-2xl font-bold text-green-800 mb-2">{t('register.successTitle')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('register.successMessage')}
            </p>
            <div className="bg-muted p-4 rounded-lg text-left mb-6">
              <p className="text-sm"><strong>{t('register.fullName')}:</strong> {formData.name}</p>
              <p className="text-sm"><strong>{t('register.email')}:</strong> {formData.email}</p>
              <p className="text-sm"><strong>{t('register.role')}:</strong> {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</p>
            </div>
            <Button onClick={() => navigate('/login')} className="w-full">
              {t('register.goToLogin')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Leaf className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">StoxxFarm</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
            <CardDescription>
              {t('register.subtitle')}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('register.fullName')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('register.fullNamePlaceholder')}
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('register.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('register.emailPlaceholder')}
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('register.password')} *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={t('register.passwordPlaceholder')}
                    disabled={isSubmitting}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('register.confirmPassword')} *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    disabled={isSubmitting}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Role and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">{t('register.role')} *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, role: value as typeof prev.role }));
                      setSelectedProduce([]); // Reset produce selection on role change
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder={t('register.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seller">{t('register.roleSeller')}</SelectItem>
                      <SelectItem value="buyer">{t('register.roleBuyer')}</SelectItem>
                      <SelectItem value="logistics">{t('register.roleLogistics')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('register.phone')} *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData(prev => ({ ...prev, phone: value }));
                    }}
                    placeholder={t('register.phonePlaceholder')}
                    maxLength={10}
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address">{t('register.address')} *</Label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isSubmitting || isGettingLocation}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>{t('register.detectingLocation')}</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3" />
                        <span>{t('register.useLocation')}</span>
                      </>
                    )}
                  </button>
                </div>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={t('register.addressPlaceholder')}
                  rows={2}
                  disabled={isSubmitting || isGettingLocation}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>

              {/* City and Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('register.city')} *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder={t('register.cityPlaceholder')}
                    disabled={isSubmitting || isGettingLocation}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">{t('register.pincode')} *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData(prev => ({ ...prev, pincode: value }));
                    }}
                    placeholder={t('register.pincodePlaceholder')}
                    maxLength={6}
                    disabled={isSubmitting || isGettingLocation}
                  />
                  {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
                </div>
              </div>

              {/* Produce Selection - Only for Sellers and Buyers */}
              {(formData.role === 'seller' || formData.role === 'buyer') && (
                <div className="space-y-2">
                  <Label>
                    {formData.role === 'seller' ? t('register.sellProduce') : t('register.buyProduce')}
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    <CreatableSelect
                      isMulti
                      options={produceOptions}
                      value={selectedProduce}
                      onChange={handleProduceChange}
                      placeholder={formData.role === 'seller' ? t('register.selectProduceSell') : t('register.selectProduceBuy')}
                      isDisabled={isSubmitting}
                      styles={selectStyles}
                      formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                      noOptionsMessage={() => 'Type to add new produce'}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('register.produceHint')}
                  </p>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t('register.terms')}
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
                  {t('register.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('register.registering')}
                    </>
                  ) : (
                    t('register.submit')
                  )}
                </Button>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {t('register.alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-primary hover:underline">
                  {t('nav.signin')}
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
