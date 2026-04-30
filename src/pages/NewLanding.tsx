import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, ChevronDown, Truck, Shield, TrendingUp, Users, AlertTriangle, DollarSign, CloudRain, BarChart2, Package, MapPin, Gavel, Sparkles, Cpu, Wallet } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import heroVideo from '@/assets/hero-video.mp4';
import subSectionVideo from '@/assets/sub-section.mp4';
import heroFarmer from '@/assets/hero-farmers.jpg';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

const NewLanding = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
            <LanguageSelector variant="transparent" scrolled={scrollY > 50} />
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className={`${scrollY > 50 ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
            >
              {t('nav.signin')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/register')}
              className={`${scrollY > 50 ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
            >
              {t('nav.register')}
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
              <span className="text-sm font-medium">{t('hero.badge')}</span>
            </div>
          </div>

          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t('hero.title1')}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
              {t('hero.title2')}
            </span>
          </h1>

          <p className={`text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {t('hero.description')}
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white text-foreground hover:bg-white/90 px-8 py-6 text-lg rounded-full font-semibold group shadow-2xl"
            >
              {t('hero.cta')}
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

      {/* Problems Section — overlaid on B&W farmer image */}
      <section className="relative overflow-hidden">
        {/* B&W farmer background image */}
        <div className="absolute inset-0">
          <img
            src={heroFarmer}
            alt="Debt-ridden Indian farmer standing on his agricultural land"
            className="w-full h-full object-cover object-center grayscale"
          />
          <div className="absolute inset-0 bg-black/75" />
        </div>

        {/* Content overlaid on image */}
        <div className="relative z-10 py-24 md:py-32">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <span className="text-red-500 text-sm font-semibold tracking-wider uppercase mb-4 block">
                The Problem
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                A system designed to<br />
                <span className="text-red-500">extract, not empower.</span>
              </h2>
              <p className="text-white/50 text-base mt-4">
                India feeds the world. Yet the people who grow the food are among its most indebted.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {[
                {
                  icon: DollarSign,
                  title: "Farmers earn the least.",
                  detail: "After 4–7 layers of middlemen, the farmer keeps a fraction of what the consumer pays. The Mandi is a tax on transparency.",
                },
                {
                  icon: BarChart2,
                  title: "Prices change daily. You hear about it weekly.",
                  detail: "By the time market price information reaches the farm, the window to sell at peak rate has already closed. Information asymmetry is how the chain extracts its value.",
                },
                {
                  icon: Package,
                  title: "30–40% of harvest never reaches a buyer.",
                  detail: "Without cold chain or pre-arranged buyers, fresh produce spoils in transit or at the mandi yard. Waste is a feature of the old system — not a bug.",
                },
                {
                  icon: CloudRain,
                  title: "When prices crash, debt is the only safety net.",
                  detail: "A single bad season triggers a loan cycle that spans years. Farmers bet their land on weather and market forces they can't see or control.",
                },
                {
                  icon: AlertTriangle,
                  title: "No contract. No guarantee. No recourse.",
                  detail: "Handshake deals with commission agents carry zero legal protection. If a buyer walks away, the farmer has no platform to dispute, renegotiate, or recover.",
                },
                {
                  icon: MapPin,
                  title: "The mandi hasn't changed in 100 years.",
                  detail: "Auctions at dawn, prices set by whoever shouts loudest, agents who answer to no one. The infrastructure of Indian agriculture has stood still while everything else moved forward.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl overflow-hidden cursor-default h-72 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-red-950/70 transition-colors duration-500"
                >
                  {/* Default state — large icon centred, title below */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-7 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-2">
                    <div className="w-20 h-20 rounded-2xl bg-red-500/15 flex items-center justify-center mb-6">
                      <item.icon className="h-10 w-10 text-red-400" />
                    </div>
                    <h3 className="text-white text-xl font-semibold leading-snug text-center">
                      {item.title}
                    </h3>
                  </div>

                  {/* Hover state */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-7 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mb-5">
                      <item.icon className="h-10 w-10 text-red-400" />
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-3 leading-snug text-center">
                      {item.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed text-center">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-tight tracking-tight">
            Stop selling.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
              Start trading.
            </span>
          </h2>
        </div>
      </section>

      {/* Why StoxxFarm — Six Layers Section */}
      <section id="features" className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-6">
            <span className="inline-block text-primary font-semibold text-base tracking-wider uppercase mb-4">
              Why StoxxFarm
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
              One platform.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                Six layers of leverage.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Every feature was designed to compound your advantage — not just solve a single problem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-14">
            {[
              {
                number: "01",
                icon: Gavel,
                title: "Live Bidding Engine",
                description: "Buyers compete in real time on transparent lots. Farmers accept the highest bid, on their schedule.",
                gradient: "from-green-500 to-emerald-600"
              },
              {
                number: "02",
                icon: Sparkles,
                title: "StoxAssist · AI Insights",
                description: "Trained on millions of historical bids. Recommends optimal listing time, lot size, and floor price.",
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                number: "03",
                icon: Cpu,
                title: "IoT Grading",
                description: "Sensor-verified quality, weight & freshness scores attached to every lot.",
                gradient: "from-purple-500 to-violet-600"
              },
              {
                number: "04",
                icon: Shield,
                title: "Quality Assurance",
                description: "Buyer-side dispute window, escrow-backed.",
                gradient: "from-orange-500 to-amber-600"
              },
              {
                number: "05",
                icon: Wallet,
                title: "Direct Payouts in 48h",
                description: "Farmer wallets settle within one business day. No invoicing, no chasing.",
                gradient: "from-rose-500 to-pink-600"
              },
              {
                number: "06",
                icon: Package,
                title: "Satellite Centre Network",
                description: "Drop produce at the nearest satellite centre for grading, storage, and onward dispatch. From farm gate to buyer warehouse — coordinated, cold-chain ready, zero middleman.",
                gradient: "from-teal-500 to-cyan-600"
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Number watermark */}
                <span className="absolute top-4 right-6 text-7xl font-black text-gray-50 select-none group-hover:text-green-50 transition-colors duration-500">
                  {item.number}
                </span>
                <div className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="relative z-10 text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="relative z-10 text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Old Features Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-green-50/50 hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
              {t('features.label')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {t('features.title1')}
              <br />{t('features.title2')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('features.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: t('features.mandiRates'),
                description: t('features.mandiRatesDesc'),
                gradient: "from-green-500 to-emerald-600"
              },
              {
                icon: Users,
                title: t('features.directConnect'),
                description: t('features.directConnectDesc'),
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                icon: Shield,
                title: t('features.verifiedQuality'),
                description: t('features.verifiedQualityDesc'),
                gradient: "from-purple-500 to-violet-600"
              },
              {
                icon: Truck,
                title: t('features.fastDelivery'),
                description: t('features.fastDeliveryDesc'),
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
                {t('howItWorks.label')}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
                {t('howItWorks.title1')}
                <br />{t('howItWorks.title2')}
              </h2>

              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: t('howItWorks.step1Title'),
                    desc: t('howItWorks.step1Desc')
                  },
                  {
                    step: "02",
                    title: t('howItWorks.step2Title'),
                    desc: t('howItWorks.step2Desc')
                  },
                  {
                    step: "03",
                    title: t('howItWorks.step3Title'),
                    desc: t('howItWorks.step3Desc')
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
                {t('howItWorks.cta')}
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
                {t('benefits.label')}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t('benefits.title')}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* For Farmers */}
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center gap-2 bg-green-100 text-primary px-4 py-2 rounded-full mb-6">
                  <span className="text-sm font-semibold">{t('benefits.farmersLabel')}</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {t('benefits.farmersTitle')}
                </h3>
                <ul className="space-y-4">
                  {[
                    t('benefits.farmers1'),
                    t('benefits.farmers2'),
                    t('benefits.farmers3'),
                    t('benefits.farmers4')
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
                  <span className="text-sm font-semibold">{t('benefits.buyersLabel')}</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {t('benefits.buyersTitle')}
                </h3>
                <ul className="space-y-4">
                  {[
                    t('benefits.buyers1'),
                    t('benefits.buyers2'),
                    t('benefits.buyers3'),
                    t('benefits.buyers4')
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
              {t('cta.title')}
            </h2>
            <p className="text-xl text-green-100 mb-10">
              {t('cta.description')}
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-white text-primary hover:bg-green-50 px-10 py-6 text-lg rounded-full font-semibold shadow-xl group"
              >
                {t('cta.button')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Partners & Buyers — dual marquee */}
      <section className="py-20 bg-white overflow-hidden border-t border-gray-100">
        <div className="container mx-auto px-6 mb-12 text-center">
          <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
            Built for India's supply chain
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Target partners &amp; buyers
          </h2>
          <p className="text-muted-foreground mt-3 text-base max-w-xl mx-auto">
            From cloud kitchens to national retail chains — StoxxFarm plugs directly into the buyers who matter.
          </p>
        </div>

        {/* Single row — scrolls right to left */}
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex gap-5 animate-marquee whitespace-nowrap">
            {[
              "JUBILANT FOODWORKS", "BIGBASKET", "BLINKIT", "RELIANCE FRESH",
              "ZEPTO", "SWIGGY INSTAMART", "HOTELS GROUP",
              "JUBILANT FOODWORKS", "BIGBASKET", "BLINKIT", "RELIANCE FRESH",
              "ZEPTO", "SWIGGY INSTAMART", "HOTELS GROUP",
            ].map((name, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-gray-200 bg-gray-50 text-sm font-black tracking-wider text-gray-800 uppercase hover:border-primary hover:text-primary hover:bg-green-50 transition-colors duration-200 cursor-default flex-shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-primary/50 flex-shrink-0" />
                {name}
              </div>
            ))}
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
                {t('footer.description')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">{t('footer.quickLinks')}</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white transition-colors">
                    {t('nav.signin')}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/register')} className="text-gray-400 hover:text-white transition-colors">
                    {t('nav.register')}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">{t('footer.contact')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li>contact@stoxxfarm.in</li>
                <li>999-999-8888</li>
                <li>Bengaluru, Karnataka</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} StoxxFarm. {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewLanding;
