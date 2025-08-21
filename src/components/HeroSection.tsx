
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

      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent z-10"></div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        <div className="max-w-5xl mx-auto">
          {/* Animated Gradient Headlines */}
          <h1 className="heading-display mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent animate-pulse bg-[length:200%_200%] animate-[shimmer_3s_ease-in-out_infinite]">
              Looking for Luxury Homes
            </span>
            <br />
            <span className="text-white">in Costa Del Sol?</span>
          </h1>
          
          <h2 className="heading-lg mb-8 animate-fade-in-delay">
            <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              We help you buy exclusive Marbella, Estepona, and Fuengirola villas
            </span>
            <br />
            <span className="text-white/90">
              with pools, ocean views, and gated security.
            </span>
          </h2>
          
          {/* Supporting Q&A */}
          <div className="mb-12 text-left max-w-3xl mx-auto animate-fade-in-delay">
            <h3 className="text-xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Where can I buy luxury homes in Costa Del Sol?
              </span>
            </h3>
            <p className="body-lg text-white/80">
              With 15+ years of expertise, Del Sol Prime Homes connects you to Marbella, Estepona, Fuengirola, and Benalmádena's finest properties.
            </p>
          </div>

          {/* Modern CTA Buttons with Brand Colors */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold px-8 py-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Your Private Viewing
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/95 text-black border-2 border-white hover:bg-white hover:shadow-lg px-8 py-4 transition-all duration-300 font-semibold"
            >
              <Eye className="w-5 h-5 mr-2" />
              Explore Virtual Tours
            </Button>
          </div>

          {/* Enhanced Quick Links */}
          <div className="animate-scale-in">
            <p className="text-white/70 mb-6 font-medium text-lg">
              <span className="bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                Explore Premium Locations
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {quickLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <button
                    key={index}
                    className="flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-gradient-to-r hover:from-yellow-400/20 hover:to-white/20 hover:border-yellow-300/50 transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm font-medium"
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
