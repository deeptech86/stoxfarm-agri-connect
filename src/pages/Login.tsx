import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';

// Decorative SVG components for vegetables/fruits
const TomatoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="36" r="24" fill="#EF4444" />
    <ellipse cx="32" cy="36" rx="20" ry="22" fill="#DC2626" />
    <path d="M32 12C32 12 28 16 28 20C28 24 32 28 32 28C32 28 36 24 36 20C36 16 32 12 32 12Z" fill="#22C55E" />
    <path d="M26 14C24 12 20 12 20 12C20 12 20 16 22 18C24 20 28 20 28 20C28 20 28 16 26 14Z" fill="#16A34A" />
    <path d="M38 14C40 12 44 12 44 12C44 12 44 16 42 18C40 20 36 20 36 20C36 20 36 16 38 14Z" fill="#16A34A" />
  </svg>
);

const CarrotIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 58L18 28C18 28 24 20 32 20C40 20 46 28 46 28L32 58Z" fill="#F97316" />
    <path d="M32 58L22 32C22 32 26 26 32 26C38 26 42 32 42 32L32 58Z" fill="#EA580C" />
    <path d="M32 6C32 6 26 12 26 18C26 24 32 26 32 26C32 26 38 24 38 18C38 12 32 6 32 6Z" fill="#22C55E" />
    <path d="M24 10C22 8 18 8 18 8C18 8 18 12 20 14C22 16 26 16 26 16C26 16 26 12 24 10Z" fill="#16A34A" />
    <path d="M40 10C42 8 46 8 46 8C46 8 46 12 44 14C42 16 38 16 38 16C38 16 38 12 40 10Z" fill="#16A34A" />
  </svg>
);

const BroccoliIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="28" y="40" width="8" height="20" rx="2" fill="#16A34A" />
    <circle cx="32" cy="28" r="14" fill="#22C55E" />
    <circle cx="22" cy="32" r="10" fill="#22C55E" />
    <circle cx="42" cy="32" r="10" fill="#22C55E" />
    <circle cx="26" cy="22" r="8" fill="#16A34A" />
    <circle cx="38" cy="22" r="8" fill="#16A34A" />
    <circle cx="32" cy="18" r="6" fill="#15803D" />
  </svg>
);

const CornIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="38" rx="12" ry="20" fill="#FCD34D" />
    <ellipse cx="32" cy="38" rx="8" ry="18" fill="#FBBF24" />
    <circle cx="28" cy="30" r="2" fill="#F59E0B" />
    <circle cx="36" cy="30" r="2" fill="#F59E0B" />
    <circle cx="28" cy="38" r="2" fill="#F59E0B" />
    <circle cx="36" cy="38" r="2" fill="#F59E0B" />
    <circle cx="28" cy="46" r="2" fill="#F59E0B" />
    <circle cx="36" cy="46" r="2" fill="#F59E0B" />
    <circle cx="32" cy="34" r="2" fill="#F59E0B" />
    <circle cx="32" cy="42" r="2" fill="#F59E0B" />
    <path d="M32 8C32 8 24 14 24 18C24 22 32 24 32 24C32 24 40 22 40 18C40 14 32 8 32 8Z" fill="#22C55E" />
    <path d="M22 12C18 10 14 12 14 12C14 12 16 16 20 18C24 20 28 18 28 18C28 18 26 14 22 12Z" fill="#16A34A" />
    <path d="M42 12C46 10 50 12 50 12C50 12 48 16 44 18C40 20 36 18 36 18C36 18 38 14 42 12Z" fill="#16A34A" />
  </svg>
);

const EggplantIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="40" rx="14" ry="20" fill="#7C3AED" />
    <ellipse cx="32" cy="42" rx="10" ry="16" fill="#6D28D9" />
    <path d="M32 10C32 10 26 14 26 20C26 24 32 26 32 26C32 26 38 24 38 20C38 14 32 10 32 10Z" fill="#22C55E" />
    <ellipse cx="32" cy="22" rx="6" ry="4" fill="#16A34A" />
  </svg>
);

const LeafPattern = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10C50 10 30 30 30 50C30 70 50 90 50 90C50 90 70 70 70 50C70 30 50 10 50 10Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M50 20C50 20 40 35 40 50C40 65 50 80 50 80" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-amber-50/30 to-green-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large leaf patterns */}
        <LeafPattern className="absolute -top-20 -left-20 w-64 h-64 text-green-600 rotate-45 opacity-50" />
        <LeafPattern className="absolute -bottom-20 -right-20 w-80 h-80 text-green-600 -rotate-45 opacity-50" />

        {/* Decorative dots pattern - top left */}
        <div className="absolute top-20 left-10 grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-amber-400/40" />
          ))}
        </div>

        {/* Decorative dots pattern - bottom right */}
        <div className="absolute bottom-32 right-16 grid grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-green-400/30" />
          ))}
        </div>

        {/* Curved lines */}
        <svg className="absolute top-32 left-32 w-32 h-32 text-green-300 opacity-60" viewBox="0 0 100 100">
          <path d="M10 50 Q 50 10 90 50" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M10 60 Q 50 20 90 60" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>

        <svg className="absolute bottom-40 right-40 w-24 h-24 text-amber-300 opacity-60" viewBox="0 0 100 100">
          <path d="M10 50 Q 50 90 90 50" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>

        {/* Vegetable icons scattered around */}
        <TomatoIcon className="absolute top-24 right-[15%] w-16 h-16 opacity-80 animate-bounce" style={{ animationDuration: '3s' }} />
        <CarrotIcon className="absolute bottom-32 left-[12%] w-14 h-14 opacity-80 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <BroccoliIcon className="absolute top-[40%] left-[8%] w-12 h-12 opacity-70 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        <CornIcon className="absolute top-[30%] right-[8%] w-14 h-14 opacity-80 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
        <EggplantIcon className="absolute bottom-[25%] right-[12%] w-12 h-12 opacity-70 animate-bounce" style={{ animationDuration: '3s', animationDelay: '2s' }} />
        <TomatoIcon className="absolute bottom-20 left-[25%] w-10 h-10 opacity-60" />
        <CarrotIcon className="absolute top-16 left-[20%] w-12 h-12 opacity-70 rotate-12" />

        {/* Abstract shapes */}
        <div className="absolute top-[45%] left-[5%] w-16 h-20 border-2 border-green-300/40 rounded-lg rotate-12" />
        <div className="absolute bottom-[35%] right-[6%] w-20 h-16 border-2 border-amber-300/40 rounded-lg -rotate-6" />

        {/* Small decorative squares */}
        <div className="absolute top-[60%] right-[18%] w-8 h-8 bg-amber-400/20 rounded" />
        <div className="absolute top-[20%] left-[30%] w-6 h-6 bg-green-400/20 rounded rotate-45" />
      </div>

      {/* Language selector */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>

      {/* Logo and brand - top left */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
          <Leaf className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold text-primary">StoxxFarm</span>
      </div>

      {/* Main login card */}
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm z-10">
        <CardContent className="pt-8 pb-6 px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('login.title')}</h1>
            <p className="text-gray-500 text-sm">{t('login.subtitle')}</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">{t('login.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('login.loggingIn') : t('login.button')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">{t('login.demoCredentials')}</span>
            </div>
          </div>

          {/* Demo credentials - compact */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleUseCredentials('admin@stoxxfarm.in', 'admin123')}
              className="text-xs h-9 border-gray-200 hover:bg-gray-50 hover:border-primary"
            >
              <span className="font-semibold text-primary">Admin</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleUseCredentials('testSeller@gmail.com', 'seller123')}
              className="text-xs h-9 border-gray-200 hover:bg-gray-50 hover:border-primary"
            >
              <span className="font-semibold text-orange-600">Seller</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleUseCredentials('BuyNow@gmail.com', 'buyer123')}
              className="text-xs h-9 border-gray-200 hover:bg-gray-50 hover:border-primary"
            >
              <span className="font-semibold text-blue-600">Buyer</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleUseCredentials('Logtest@gmail.com', 'logistics123')}
              className="text-xs h-9 border-gray-200 hover:bg-gray-50 hover:border-primary"
            >
              <span className="font-semibold text-purple-600">Logistics</span>
            </Button>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {t('register.noAccount')}{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              {t('nav.signup')}
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-xs text-gray-400 z-10">
        <p>© {new Date().getFullYear()} StoxxFarm. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
