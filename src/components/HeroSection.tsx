
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30 z-10"></div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-white">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Headlines */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight tracking-tight px-2 sm:px-0">
              <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_200%] block sm:inline">
                Looking for Luxury Homes
              </span>
              <br className="hidden xs:block" />
              <span className="text-white block sm:inline">in Costa Del Sol?</span>
            </h1>
            
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-heading font-semibold leading-relaxed px-2 sm:px-0">
              <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent block sm:inline">
                We help you buy exclusive Marbella, Estepona, and Fuengirola villas
              </span>
              <br className="hidden sm:block" />
              <span className="text-white/90 block sm:inline">
                with pools, ocean views, and gated security.
              </span>
            </h2>
          </div>
          
          {/* Supporting Q&A */}
          <div className="max-w-4xl mx-auto text-center sm:text-left px-4 sm:px-0">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Where can I buy luxury homes in Costa Del Sol?
              </span>
            </h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 leading-relaxed">
              With 15+ years of expertise, Del Sol Prime Homes connects you to Marbella, Estepona, Fuengirola, and Benalmádena's finest properties.
            </p>
          </div>

          {/* CTA Buttons - Enhanced Visibility */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-2xl mx-auto pt-6 sm:pt-8 px-4 sm:px-0">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-2xl hover:shadow-yellow-500/25 hover:scale-105 transition-all duration-300 border-0 min-h-[48px] sm:min-h-[56px]"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              <span className="text-sm sm:text-base lg:text-lg">Book Your Private Viewing</span>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto bg-white text-black border-2 border-white hover:bg-white/90 hover:shadow-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 font-semibold min-h-[48px] sm:min-h-[56px]"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              <span className="text-sm sm:text-base lg:text-lg">Explore Virtual Tours</span>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8 px-4 sm:px-0">
            <p className="text-white/70 font-medium text-base sm:text-lg">
              <span className="bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                Explore Premium Locations
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
              {quickLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <button
                    key={index}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white/15 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-gradient-to-r hover:from-yellow-400/20 hover:to-white/20 hover:border-yellow-300/50 transition-all duration-300 hover:scale-105 hover:shadow-lg text-xs sm:text-sm font-medium min-h-[40px] sm:min-h-auto"
                  >
                    <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap text-xs sm:text-sm">{link.name}</span>
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
