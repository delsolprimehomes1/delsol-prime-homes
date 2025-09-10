
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Eye } from 'lucide-react';

const HeroSection = () => {

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

      {/* Enhanced Responsive Gradient Overlay - Lighter for better mobile readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/20 sm:from-black/50 sm:via-black/30 sm:to-black/10 z-10"></div>

      {/* Responsive Content Container - Better Mobile Layout */}
      <div className="relative z-20 container mx-auto px-6 py-16 sm:py-20 md:py-24 text-center text-white safe-area-inset-top flex items-center justify-center min-h-dvh">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
          {/* Enhanced Headlines with Better Mobile Typography */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold leading-[1.1] tracking-tight">
              <span className="block bg-gradient-to-r from-white via-yellow-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(255,215,0,0.8)]">
                Looking for Luxury Homes
              </span>
              <span className="block text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] mt-2">
                in Costa Del Sol?
              </span>
            </h1>
            
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-heading font-medium leading-relaxed max-w-4xl mx-auto">
              <span className="block bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent font-semibold mb-2">
                We help you buy exclusive villas in
              </span>
              <span className="block text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                Marbella, Estepona & Fuengirola
              </span>
            </h2>
          </div>
          
          {/* Enhanced Supporting Content with Modern Mobile Design */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  15+ Years of Luxury Real Estate Expertise
                </span>
              </h3>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed font-medium">
                Premium villas • Ocean views • Gated communities • Private pools
              </p>
            </div>
          </div>

          {/* Enhanced Mobile-First CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-2xl mx-auto pt-6 sm:pt-8">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-bold px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 transition-all duration-300 border-0 min-h-[56px] sm:min-h-[64px] mobile-touch-target will-change-transform rounded-xl"
            >
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
              Book Private Viewing
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto bg-white/10 text-white border-2 border-white/50 hover:bg-white/20 hover:border-white hover:shadow-xl px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl transition-all duration-300 font-semibold min-h-[56px] sm:min-h-[64px] mobile-touch-target will-change-transform backdrop-blur-sm rounded-xl"
            >
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
              Virtual Tours
            </Button>
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
