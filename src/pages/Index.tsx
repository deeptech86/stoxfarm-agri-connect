import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sprout, TrendingUp, Users, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className="bg-primary text-primary-foreground p-6 rounded-full">
              <Sprout className="h-16 w-16" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Welcome to StoxFarm
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground">
            India's Agricultural Marketplace connecting Farmers and Buyers
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-8">
            <Button size="lg" onClick={() => navigate('/login')} className="text-lg px-8">
              Login to Your Account
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <TrendingUp className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Live Mandi Rates</h3>
              <p className="text-muted-foreground">Get real-time market rates for all produce</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Direct Connection</h3>
              <p className="text-muted-foreground">Connect farmers directly with buyers</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Shield className="h-12 w-12 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg">Secure Transactions</h3>
              <p className="text-muted-foreground">Admin-verified listings and secure deals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
