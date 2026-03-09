import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, ChevronDown, Truck, Shield, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import heroVideo from '@/assets/hero-video.mp4';
import subSectionVideo from '@/assets/sub-section.mp4';

const NewLanding = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Set hero video playback speed to 0.75x
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
        backgroundColor: scrollY > 50 ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(0,0,0,0.05)' : 'none'
      }}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors ${scrollY > 50 ? 'text-foreground' : 'text-white'}`}>
              StoxxFarm
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className={`${scrollY > 50 ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
            >
              Sign in
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/register')}
              className={`${scrollY > 50 ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
            >
              Register
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            src={heroVideo}
            onLoadedData={(e) => {
              e.currentTarget.playbackRate = 0.75;
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full mb-8 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium">Farm to Table, Simplified</span>
            </div>
          </div>

          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Fresh Produce,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
              Direct from Farms
            </span>
          </h1>

          <p className={`text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Connect with local farmers, access real-time market prices, and get premium quality vegetables delivered fresh to your business.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white text-foreground hover:bg-white/90 px-8 py-6 text-lg rounded-full font-semibold group shadow-2xl"
            >
              Start Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <button onClick={scrollToContent} className="text-white/60 hover:text-white transition-colors">
            <ChevronDown className="h-8 w-8" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 bg-gradient-to-b from-white to-green-50/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
              Why StoxxFarm
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              The smarter way to source
              <br />fresh produce
            </h2>
            <p className="text-lg text-muted-foreground">
              We're building the future of agricultural commerce with technology that connects farmers directly to buyers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Live Mandi Rates",
                description: "Real-time market prices from mandis across India",
                gradient: "from-green-500 to-emerald-600"
              },
              {
                icon: Users,
                title: "Direct Connect",
                description: "Eliminate middlemen, connect directly with farmers",
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                icon: Shield,
                title: "Verified Quality",
                description: "Admin-verified listings and secure transactions",
                gradient: "from-purple-500 to-violet-600"
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Fresh produce delivered with care and speed",
                gradient: "from-orange-500 to-amber-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
                Simple steps to
                <br />get started
              </h2>

              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Create Account",
                    desc: "Sign up as a farmer, buyer, or logistics partner in minutes"
                  },
                  {
                    step: "02",
                    title: "Browse & Connect",
                    desc: "Explore listings, check live prices, and connect with partners"
                  },
                  {
                    step: "03",
                    title: "Trade & Deliver",
                    desc: "Place bids, finalize deals, and get fresh produce delivered"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-6 group">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="mt-10 bg-primary hover:bg-primary/90 rounded-full px-8 py-6 text-lg group"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-50 p-8">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover rounded-2xl shadow-2xl"
                  src={subSectionVideo}
                />
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-xl animate-float">
                <Leaf className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl animate-float-reverse">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-green-50/50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
                Benefits
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Everyone wins with StoxxFarm
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* For Farmers */}
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center gap-2 bg-green-100 text-primary px-4 py-2 rounded-full mb-6">
                  <span className="text-sm font-semibold">For Farmers</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Get fair prices for your produce
                </h3>
                <ul className="space-y-4">
                  {[
                    "Farmers to choose their own pricing",
                    "Real-time market insights and pricing",
                    "Secure and timely payments",
                    "Direct access to end customers with transparent pricing"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Buyers */}
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-6">
                  <span className="text-sm font-semibold">For Buyers</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Source quality produce efficiently
                </h3>
                <ul className="space-y-4">
                  {[
                    "Farm-fresh vegetables at competitive prices",
                    "Verified quality from trusted farmers",
                    "Streamlined ordering and delivery",
                    "Transparent pricing with no hidden costs"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform how you trade produce?
            </h2>
            <p className="text-xl text-green-100 mb-10">
              Join the agricultural revolution. Connect with farmers and buyers across India today.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-white text-primary hover:bg-green-50 px-10 py-6 text-lg rounded-full font-semibold shadow-xl group"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-foreground">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">StoxxFarm</span>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                Connecting farmers directly with buyers for fresh, quality produce at fair prices. Building a sustainable agricultural ecosystem for India.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/register')} className="text-gray-400 hover:text-white transition-colors">
                    Register
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li>contact@stoxxfarm.in</li>
                <li>999-999-8888</li>
                <li>Bengaluru, Karnataka</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} StoxxFarm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewLanding;
