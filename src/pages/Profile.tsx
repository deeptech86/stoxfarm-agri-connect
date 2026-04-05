import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateUser } from '@/hooks/useUsers';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const updateUserMutation = useUpdateUser();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: (user as unknown as { city?: string })?.city || '',
    pincode: (user as unknown as { pincode?: string })?.pincode || '',
    notes: user?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = t('validation.phoneInvalid');
    }

    if (formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = t('validation.pincodeInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim() || undefined,
          pincode: formData.pincode.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        },
      });
      await refreshUser();
      setEditing(false);
      toast({
        title: t('profile.updated'),
        description: t('profile.updatedDesc'),
      });
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error ? error.message : t('profile.updateError');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.title')}</CardTitle>
            <CardDescription>{t('profile.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profilePic} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                {t('profile.changePhoto')}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.email')}</Label>
                <Input value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label>{t('common.role')}</Label>
                <Input value={user.role} disabled className="capitalize" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t('common.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('common.phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: value });
                  }}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  disabled={!editing}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('common.address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!editing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('common.city')}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">{t('common.pincode')}</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData({ ...formData, pincode: value });
                    }}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    disabled={!editing}
                  />
                  {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('profile.notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!editing}
                  rows={4}
                />
              </div>

              {/* Satellite Center Fields - for Seller, Buyer, Logistics */}
              {['seller', 'buyer', 'logistics'].includes(user.role) && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  <Label className="text-base font-semibold">{t('profile.satelliteInfo')}</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="satelliteCenterName">{t('centers.centerName')}</Label>
                      <Input
                        id="satelliteCenterName"
                        value={user.satelliteCenterName || t('centers.notAssigned')}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="satelliteCenterId">{t('centers.centerId')}</Label>
                      <Input
                        id="satelliteCenterId"
                        value={user.satelliteCenterId || t('centers.notAssigned')}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!editing ? (
                <Button onClick={() => setEditing(true)} className="w-full">
                  {t('profile.editProfile')}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="flex-1"
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('common.saving')}
                      </>
                    ) : (
                      t('profile.saveChanges')
                    )}
                  </Button>
                  <Button
                    onClick={() => setEditing(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={updateUserMutation.isPending}
                  >
                    {t('common.cancel')}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
