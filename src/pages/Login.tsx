import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleUseCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <Sprout className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('login.loggingIn') : t('login.button')}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg text-sm space-y-3">
            <p className="font-semibold">{t('login.demoCredentials')}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p><span className="font-medium">Admin:</span> admin@stoxxfarm.in / admin123</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseCredentials('admin@stoxxfarm.in', 'admin123')}
                >
                  {t('login.use')}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p><span className="font-medium">Seller:</span> testSeller@gmail.com / seller123</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseCredentials('testSeller@gmail.com', 'seller123')}
                >
                  {t('login.use')}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p><span className="font-medium">Buyer:</span> BuyNow@gmail.com / buyer123</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseCredentials('BuyNow@gmail.com', 'buyer123')}
                >
                  {t('login.use')}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p><span className="font-medium">Logistics:</span> Logtest@gmail.com / logistics123</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseCredentials('Logtest@gmail.com', 'logistics123')}
                >
                  {t('login.use')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
