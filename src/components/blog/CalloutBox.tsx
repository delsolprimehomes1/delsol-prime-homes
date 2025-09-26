import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Download, Phone, Mail, Calendar } from 'lucide-react';

interface CalloutBoxProps {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  variant?: 'primary' | 'secondary' | 'accent';
  type?: 'download' | 'contact' | 'booking' | 'general';
  badge?: string;
  className?: string;
}

export const CalloutBox: React.FC<CalloutBoxProps> = ({
  title,
  description,
  ctaText,
  ctaUrl,
  variant = 'primary',
  type = 'general',
  badge,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'contact':
        return <Mail className="h-4 w-4" />;
      case 'booking':
        return <Calendar className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 border-primary/20 text-foreground';
      case 'secondary':
        return 'bg-secondary/10 border-secondary/20 text-foreground';
      case 'accent':
        return 'bg-accent/10 border-accent/20 text-foreground';
      default:
        return 'bg-muted/50 border-border text-foreground';
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'accent':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card className={`${getVariantClasses()} ${className} my-8`}>
      <CardContent className="p-6 md:p-8">
        <div className="text-center space-y-4">
          {badge && (
            <Badge variant="secondary" className="mb-2">
              {badge}
            </Badge>
          )}
          
          <h3 className="text-xl md:text-2xl font-bold leading-tight">
            {title}
          </h3>
          
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          
          <div className="pt-2">
            <Button 
              asChild 
              size="lg" 
              variant={getButtonVariant()}
              className="inline-flex items-center gap-2 px-6 py-3"
            >
              <a 
                href={ctaUrl} 
                target={ctaUrl.startsWith('http') ? '_blank' : '_self'}
                rel={ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {getIcon()}
                {ctaText}
              </a>
            </Button>
          </div>
          
          {type === 'contact' && (
            <div className="flex items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>Quick Response</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>No Obligation</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};