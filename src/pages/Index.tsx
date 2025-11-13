import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Shield } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import carouselFarmers from '@/assets/carousel-farmers-1.jpg';
import carouselKitchen from '@/assets/carousel-kitchen-1.jpg';
import carouselMarket from '@/assets/carousel-market-1.jpg';

const Index = () => {
  const navigate = useNavigate();

  const carouselImages = [
    { src: carouselFarmers, alt: "Indian farmers with fresh produce in fields" },
    { src: carouselKitchen, alt: "Restaurant kitchen with chefs preparing fresh vegetables" },
    { src: carouselMarket, alt: "Farmers at produce market with fresh vegetables" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden">
        <Carousel
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {carouselImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[600px] md:h-[700px]">
                  <div className="absolute inset-0">
                    <img 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-background/30 to-background/50" />
                  </div>
                  <div className="relative container mx-auto h-full flex items-center justify-center px-4">
                    <div className="max-w-3xl space-y-6 text-center">
                      <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                        Welcome to <span className="text-primary">StoxFarm</span>
                      </h1>
                      <p className="text-xl text-foreground">
                        Connecting farmers directly with buyers for fresh, quality produce at fair prices
                      </p>
                      <div className="flex gap-4 flex-wrap justify-center">
                        <Button size="lg" onClick={() => navigate('/login')}>
                          Get Started
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
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
