import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sprout, TrendingUp, Users, Shield } from 'lucide-react';
import heroImage from '@/assets/hero-farmers.jpg';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Indian farmers with fresh produce" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        <div className="relative container mx-auto py-20 px-4">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Welcome to <span className="text-primary">StoxFarm</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connecting farmers directly with buyers for fresh, quality produce at fair prices
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button size="lg" onClick={() => navigate('/login')}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
      </section>
    </div>
  );
};

export default Index;
