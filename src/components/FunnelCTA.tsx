import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, ArrowRight, Lightbulb, TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FunnelLink {
  text: string;
  url: string;
}

interface FunnelCTAProps {
  stage: 'tofu' | 'mofu' | 'bofu';
  link: FunnelLink;
  onAnalyticsEvent?: (event: string, data: any) => void;
  className?: string;
}

const stageConfig = {
  tofu: {
    title: 'Learn More',
    description: 'Explore the fundamentals',
    icon: Lightbulb,
    colors: {
      gradient: 'from-blue-50/50 to-blue-100/50',
      border: 'border-blue-200/50',
      text: 'text-blue-800',
      titleText: 'text-blue-900',
      iconColor: 'text-blue-600',
      buttonBorder: 'border-blue-200',
      buttonHover: 'hover:bg-blue-50'
    }
  },
  mofu: {
    title: 'Compare Options',
    description: 'Find the right solution',
    icon: TrendingUp,
    colors: {
      gradient: 'from-amber-50/50 to-amber-100/50',
      border: 'border-amber-200/50',
      text: 'text-amber-800',
      titleText: 'text-amber-900',
      iconColor: 'text-amber-600',
      buttonBorder: 'border-amber-200',
      buttonHover: 'hover:bg-amber-50'
    }
  },
  bofu: {
    title: 'Ready to Act?',
    description: 'Take the next step',
    icon: CheckCircle,
    colors: {
      gradient: 'from-emerald-50/50 to-emerald-100/50',
      border: 'border-emerald-200/50',
      text: 'text-emerald-800',
      titleText: 'text-emerald-900',
      iconColor: 'text-emerald-600',
      buttonBorder: 'border-emerald-200',
      buttonHover: 'hover:bg-emerald-50'
    }
  }
};

export function FunnelCTA({ stage, link, onAnalyticsEvent, className }: FunnelCTAProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;
  
  const handleClick = () => {
    if (onAnalyticsEvent) {
      onAnalyticsEvent('funnel_next_step', {
        from_stage: stage,
        to_url: link.url,
        cta_text: link.text
      });
    }
  };

  const isExternal = link.url.startsWith('http') || link.url.startsWith('mailto') || link.url.startsWith('tel');
  const isBofu = stage === 'bofu';

  return (
    <Card className={cn(
      `bg-gradient-to-r ${config.colors.gradient} ${config.colors.border} hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${config.colors.iconColor}`} />
              <h4 className={`font-semibold ${config.colors.titleText}`}>
                {config.title}
              </h4>
            </div>
            <p className={`${config.colors.text} leading-relaxed pr-4`}>
              {link.text}
            </p>
          </div>
          
          {isExternal ? (
            <Button 
              variant={isBofu ? "default" : "outline"} 
              asChild 
              className={cn(
                isBofu 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                  : `${config.colors.buttonBorder} ${config.colors.buttonHover} transition-all duration-300 hover:scale-105`
              )}
              onClick={handleClick}
            >
              <a 
                href={link.url}
                target={link.url.startsWith('http') ? "_blank" : undefined}
                rel={link.url.startsWith('http') ? "noopener noreferrer" : undefined}
                aria-label={`${link.text} (${isExternal ? 'opens in new tab' : ''})`}
              >
                {isBofu ? 'Get Started' : 'Explore'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button 
              variant={isBofu ? "default" : "outline"} 
              asChild 
              className={cn(
                isBofu 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                  : `${config.colors.buttonBorder} ${config.colors.buttonHover} transition-all duration-300 hover:scale-105`
              )}
              onClick={handleClick}
            >
              <Link 
                to={link.url}
                aria-label={link.text}
              >
                {isBofu ? 'Get Started' : 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}