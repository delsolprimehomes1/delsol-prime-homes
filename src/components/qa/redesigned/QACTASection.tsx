import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QACTASectionProps {
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  topic?: string;
  className?: string;
}

export const QACTASection: React.FC<QACTASectionProps> = ({
  funnelStage,
  topic,
  className = "",
}) => {
  const ctaConfig = {
    TOFU: {
      title: "Ready to Learn More?",
      subtitle: "Explore Costa del Sol property opportunities",
      primaryCTA: {
        text: "Browse Properties",
        href: "/#properties",
        icon: ArrowRight,
      },
      secondaryCTA: {
        text: "Read Market Guides",
        href: "/blog",
        icon: MessageCircle,
      },
      bgClass: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    MOFU: {
      title: "Ready to See Options?",
      subtitle: "Compare properties and get personalized recommendations",
      primaryCTA: {
        text: "Schedule Consultation",
        href: "/book-viewing",
        icon: Calendar,
      },
      secondaryCTA: {
        text: "Get Market Analysis",
        href: "/contact",
        icon: MessageCircle,
      },
      bgClass: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    BOFU: {
      title: "Ready to Make Your Move?",
      subtitle: "Get expert guidance for your Costa del Sol purchase", 
      primaryCTA: {
        text: "Book Free Consultation",
        href: "/book-viewing",
        icon: Calendar,
      },
      secondaryCTA: {
        text: "Call Expert Now",
        href: "tel:+34952123456",
        icon: Phone,
      },
      bgClass: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
  };

  const config = ctaConfig[funnelStage];
  const PrimaryIcon = config.primaryCTA.icon;
  const SecondaryIcon = config.secondaryCTA.icon;

  return (
    <Card className={`${config.bgClass} rounded-2xl p-6 text-white border-0 ${className}`}>
      <div className="text-center">
        {/* Stage Badge */}
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
          {funnelStage === 'TOFU' ? 'Getting Started' : 
           funnelStage === 'MOFU' ? 'Researching' : 'Ready to Buy'}
        </Badge>

        {/* Title & Subtitle */}
        <h3 className="text-xl font-bold mb-2">{config.title}</h3>
        <p className="text-white/90 mb-6">{config.subtitle}</p>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            asChild
            size="lg"
            className="w-full bg-white text-gray-900 hover:bg-gray-50 font-semibold"
          >
            <Link to={config.primaryCTA.href}>
              <PrimaryIcon className="w-4 h-4 mr-2" />
              {config.primaryCTA.text}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white"
          >
            <Link to={config.secondaryCTA.href}>
              <SecondaryIcon className="w-4 h-4 mr-2" />
              {config.secondaryCTA.text}
            </Link>
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              ✓ Free Consultation
            </span>
            <span className="flex items-center gap-1">
              ✓ Expert Guidance
            </span>
            <span className="flex items-center gap-1">
              ✓ No Obligation
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QACTASection;