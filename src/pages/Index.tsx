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

      {/* What We Offer Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What We Offer</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how StoxFarm revolutionizes agricultural commerce with innovative solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="flex justify-center">
              <TrendingUp className="h-14 w-14 text-primary" />
            </div>
            <h3 className="font-semibold text-xl">Live Mandi Rates</h3>
            <p className="text-muted-foreground">
              Access real-time market rates from mandis across India. Make informed decisions with up-to-date pricing information that helps you get the best value for your produce or purchases.
            </p>
          </div>
          
          <div className="text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="flex justify-center">
              <Users className="h-14 w-14 text-accent" />
            </div>
            <h3 className="font-semibold text-xl">Direct Connections</h3>
            <p className="text-muted-foreground">
              Cut out the middlemen and connect farmers directly with buyers. Build lasting relationships, ensure fair prices for farmers, and get quality produce at competitive rates for your business.
            </p>
          </div>
          
          <div className="text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="flex justify-center">
              <Shield className="h-14 w-14 text-secondary" />
            </div>
            <h3 className="font-semibold text-xl">Secure Transactions</h3>
            <p className="text-muted-foreground">
              Every listing is verified and transactions are monitored for security. Our admin-verified system ensures authenticity, while our secure payment process protects both buyers and sellers.
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="flex justify-center">
              <TrendingUp className="h-14 w-14 text-primary" />
            </div>
            <h3 className="font-semibold text-xl">Fresh Ingredients Delivered</h3>
            <p className="text-muted-foreground">
              Get farm-fresh vegetables and produce delivered directly to your commercial kitchens. Our logistics network ensures quality is maintained from farm to your doorstep with minimal handling.
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="flex justify-center">
              <Shield className="h-14 w-14 text-accent" />
            </div>
            <h3 className="font-semibold text-xl">Save Time and Money</h3>
            <p className="text-muted-foreground">
              Streamline your sourcing process with our efficient platform. Reduce procurement costs, eliminate unnecessary middlemen fees, and spend less time negotiating by leveraging our transparent pricing system.
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">About Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the dedicated team behind StoxFarm
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card border">
              <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Rahul</h3>
              <p className="text-sm font-medium text-primary">Logistics & Operations</p>
              <p className="text-muted-foreground text-sm">
                Rahul oversees our logistics network and operational efficiency, ensuring smooth delivery from farms to buyers. With his expertise, he manages supply chain optimization and coordinates with logistics partners across India.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card border">
              <div className="w-20 h-20 bg-accent/10 rounded-full mx-auto flex items-center justify-center">
                <TrendingUp className="h-10 w-10 text-accent" />
              </div>
              <h3 className="font-semibold text-xl">Nihil</h3>
              <p className="text-sm font-medium text-accent">Marketing & Operations</p>
              <p className="text-muted-foreground text-sm">
                Nihil drives our marketing strategies and operational processes, connecting with farmers and buyers to grow our community. He focuses on brand development and ensuring operational excellence across all touchpoints.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card border">
              <div className="w-20 h-20 bg-secondary/10 rounded-full mx-auto flex items-center justify-center">
                <Shield className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="font-semibold text-xl">Nimit</h3>
              <p className="text-sm font-medium text-secondary">Marketing & Tech</p>
              <p className="text-muted-foreground text-sm">
                Nimit bridges marketing and technology, leveraging digital tools to reach our audience effectively. He manages our online presence and ensures our technical solutions align with market needs and user experience.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card border">
              <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Daipayan</h3>
              <p className="text-sm font-medium text-primary">Tech</p>
              <p className="text-muted-foreground text-sm">
                Daipayan leads our technical development, building and maintaining the StoxFarm platform. He ensures our systems are robust, scalable, and user-friendly, implementing innovative solutions to connect farmers and buyers seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">StoxFarm</h3>
              <p className="text-muted-foreground text-sm">
                Connecting farmers directly with buyers for fresh, quality produce at fair prices.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <div className="flex flex-col space-y-2">
                <Button variant="link" className="justify-start p-0 h-auto" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="link" className="justify-start p-0 h-auto" onClick={() => navigate('/login')}>
                  Get Started
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contact Us</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Email: contact@stoxfarm.com</p>
                <p>Phone: +91 98765 43210</p>
                <p>Address: Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} StoxFarm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
