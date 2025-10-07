import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Use any email from mock data.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <Sprout className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">StoxFarm</CardTitle>
          <CardDescription>Agricultural Marketplace for India</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (any text)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg text-sm space-y-2">
            <p className="font-semibold">Demo Credentials:</p>
            <p>Admin: admin@stoxfarm.in</p>
            <p>Seller: rajesh@farm.in</p>
            <p>Buyer: anil@buyer.in</p>
            <p>Logistics: fast@logistics.in</p>
            <p className="text-xs text-muted-foreground mt-2">Password: any text</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
