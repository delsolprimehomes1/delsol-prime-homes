import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Shield, Award, Phone, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';

interface EnhancedBOFUConversionProps {
  articleSlug: string;
  topic?: string;
  className?: string;
}

export const EnhancedBOFUConversion: React.FC<EnhancedBOFUConversionProps> = ({
  articleSlug,
  topic,
  className = ''
}) => {
  const handleBookingClick = (ctaType: string) => {
    trackCTAClick(ctaType, 'bofu_enhanced_booking', '#booking-chatbot');
    
    // Scroll to booking chatbot
    const chatbotElement = document.querySelector('[data-booking-chatbot]');
    if (chatbotElement) {
      chatbotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Urgency & Social Proof Card */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <Badge variant="destructive" className="animate-pulse">
              Limited Time Offer
            </Badge>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground">
            Your Dream Home is Waiting
          </h3>
          
          <p className="text-muted-foreground">
            Don't miss out on the best properties. Our experts are ready to help you secure your perfect Costa del Sol home today.
          </p>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Trusted by 500+ clients</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Licensed professionals</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Multiple CTA Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Primary CTA - Book Consultation */}
        <Card className="p-4 text-center hover:shadow-lg transition-all duration-200">
          <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
          <h4 className="font-semibold mb-1">Book Consultation</h4>
          <p className="text-xs text-muted-foreground mb-3">Free 30-min property review</p>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => handleBookingClick('bofu_primary_booking')}
          >
            Schedule Now
          </Button>
        </Card>

        {/* Secondary CTA - Call Expert */}
        <Card className="p-4 text-center hover:shadow-lg transition-all duration-200">
          <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-semibold mb-1">Call Expert</h4>
          <p className="text-xs text-muted-foreground mb-3">Speak to someone today</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => handleBookingClick('bofu_phone_cta')}
          >
            Call Now
          </Button>
        </Card>

        {/* Tertiary CTA - Chat Now */}
        <Card className="p-4 text-center hover:shadow-lg transition-all duration-200">
          <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold mb-1">AI Assistant</h4>
          <p className="text-xs text-muted-foreground mb-3">Get instant answers</p>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => handleBookingClick('bofu_chat_cta')}
          >
            Chat Now
          </Button>
        </Card>
      </div>

      {/* Trust Guarantees */}
      <Card className="p-4 bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs text-muted-foreground">No obligation</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs text-muted-foreground">Free consultation</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs text-muted-foreground">Licensed agents</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs text-muted-foreground">Market expertise</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedBOFUConversion;