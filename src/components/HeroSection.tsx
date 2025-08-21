
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
    <section className="relative min-h-dvh flex items-center justify-center overflow-hidden">
      {/* Optimized Video Background with responsive sources */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover will-change-auto"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/placeholder.svg"
          aria-label="Luxury Costa Del Sol properties showcase video"
          style={{ filter: 'brightness(0.85)' }}
        >
          <source
            src="https://storage.googleapis.com/msgsndr/9m2UBN29nuaCWceOgW2Z/media/68a69bbece523c31db0bb311.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />
          <source
            src="https://storage.googleapis.com/msgsndr/9m2UBN29nuaCWceOgW2Z/media/68a69bbece523c31db0bb311.mp4"
            type="video/mp4"
            media="(max-width: 767px)"
          />
          <track kind="captions" src="" srcLang="en" label="English" />
        </video>
      </div>

      {/* Enhanced Responsive Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40 sm:from-black/70 sm:via-black/50 sm:to-black/30 z-10"></div>

      {/* Responsive Content Container */}
      <div className="relative z-20 container mx-auto px-4 pt-16 pb-8 sm:py-12 md:py-16 text-center text-white safe-area-inset-top">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
          {/* Enhanced Headlines with Better Mobile Typography */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold leading-tight tracking-tight">
              <span className="text-white drop-shadow-[0_0_20px_rgba(255,215,0,0.6)] md:bg-gradient-to-r md:from-white md:via-yellow-200 md:to-yellow-400 md:bg-clip-text md:text-transparent md:animate-shimmer">
                Looking for Luxury Homes
              </span>
              <br />
              <span className="text-white drop-shadow-lg">in Costa Del Sol?</span>
            </h1>
            
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-heading font-semibold leading-relaxed max-w-5xl mx-auto">
              <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                We help you buy exclusive Marbella, Estepona, and Fuengirola villas
              </span>
              <br className="hidden sm:block" />
              <span className="text-white/95 drop-shadow-md">
                with pools, ocean views, and gated security.
              </span>
            </h2>
          </div>
          
          {/* Enhanced Supporting Q&A with Mobile Optimization */}
          <div className="max-w-5xl mx-auto text-center sm:text-left px-2 sm:px-4">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                Where can I buy luxury homes in Costa Del Sol?
              </span>
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-white/85 leading-relaxed drop-shadow-sm">
              With 15+ years of expertise, Del Sol Prime Homes connects you to Marbella, Estepona, Fuengirola, and Benalmádena's finest properties.
            </p>
          </div>

          {/* Enhanced Mobile-First CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-2xl mx-auto pt-6 sm:pt-8 px-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-2xl hover:shadow-yellow-500/25 hover:scale-105 transition-all duration-300 border-0 min-h-[48px] sm:min-h-[56px] mobile-touch-target will-change-transform"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Book Your Private Viewing
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto bg-white/95 text-black border-2 border-white hover:bg-white hover:shadow-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 font-semibold min-h-[48px] sm:min-h-[56px] mobile-touch-target will-change-transform backdrop-blur-sm"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Explore Virtual Tours
            </Button>
          </div>

          {/* Enhanced Mobile-Optimized Quick Links */}
          <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8">
            <p className="text-white/80 font-medium text-base sm:text-lg">
              <span className="bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent drop-shadow-sm">
                Explore Premium Locations
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-5xl mx-auto px-2">
              {quickLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <button
                    key={index}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/40 text-white hover:bg-gradient-to-r hover:from-yellow-400/30 hover:to-white/25 hover:border-yellow-300/60 transition-all duration-300 hover:scale-105 hover:shadow-lg text-xs sm:text-sm font-medium mobile-touch-target will-change-transform"
                  >
                    <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{link.name}</span>
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
