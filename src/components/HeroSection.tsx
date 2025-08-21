
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, MapPin } from 'lucide-react';

const HeroSection = () => {
  const quickLinks = [
    { name: 'Marbella Luxury Homes', icon: MapPin },
    { name: 'Estepona Luxury Homes', icon: MapPin },
    { name: 'Mijas Luxury Homes', icon: MapPin },
    { name: 'Fuengirola Luxury Homes', icon: MapPin },
    { name: 'Benalmádena Luxury Homes', icon: MapPin },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/placeholder.svg"
          aria-label="Luxury Costa Del Sol properties showcase video"
        >
          <source
            src="https://storage.googleapis.com/msgsndr/9m2UBN29nuaCWceOgW2Z/media/68a69bbece523c31db0bb311.mp4"
            type="video/mp4"
          />
          <track kind="captions" src="" srcLang="en" label="English" />
        </video>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 hero-overlay z-10"></div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        <div className="max-w-5xl mx-auto">
          {/* Main Headlines */}
          <h1 className="heading-display mb-6 animate-fade-in-up">
            Looking for Luxury Homes in Costa Del Sol?
          </h1>
          <h2 className="heading-lg mb-8 text-white/90 animate-fade-in-delay">
            We help you buy exclusive Marbella, Estepona, and Fuengirola villas with pools, ocean views, and gated security.
          </h2>
          
          {/* Supporting Q&A */}
          <div className="mb-12 text-left max-w-3xl mx-auto animate-fade-in-delay">
            <h3 className="text-xl font-semibold text-white mb-4">Where can I buy luxury homes in Costa Del Sol?</h3>
            <p className="body-lg text-white/80">
              With 15+ years of expertise, Del Sol Prime Homes connects you to Marbella, Estepona, Fuengirola, and Benalmádena's finest properties.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="gold-gradient text-secondary font-semibold px-8 py-4 hover-gold group"
            >
              <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Book Your Private Viewing
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 px-8 py-4 transition-all duration-300"
            >
              <Eye className="w-5 h-5 mr-2" />
              Explore Virtual Tours
            </Button>
          </div>

          {/* Quick Links */}
          <div className="animate-scale-in">
            <p className="text-white/70 mb-6 font-medium">Explore Premium Locations</p>
            <div className="flex flex-wrap justify-center gap-4">
              {quickLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <button
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white/90 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover-lift text-sm"
                  >
                    <IconComponent className="w-4 h-4" />
                    {link.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Schema Markup for Video */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          "name": "Luxury Costa Del Sol Properties",
          "description": "Showcase of luxury real estate properties in Marbella, Estepona, and Fuengirola",
          "thumbnailUrl": "/placeholder.svg",
          "contentUrl": "https://storage.googleapis.com/msgsndr/9m2UBN29nuaCWceOgW2Z/media/68a69bbece523c31db0bb311.mp4",
          "uploadDate": "2024-01-01",
          "duration": "PT30S"
        })
      }} />
    </section>
  );
};

export default HeroSection;
