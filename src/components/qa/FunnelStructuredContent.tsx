import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Users, Zap, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FunnelContentSection {
  id: string;
  title: string;
  content: string;
  type: 'TOFU' | 'MOFU' | 'BOFU';
  cta?: {
    text: string;
    href: string;
    type: 'internal' | 'external' | 'action';
  };
}

interface FunnelStructuredContentProps {
  sections: FunnelContentSection[];
  className?: string;
}

export const FunnelStructuredContent: React.FC<FunnelStructuredContentProps> = ({
  sections,
  className = ''
}) => {
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'TOFU': return Info;
      case 'MOFU': return Users;
      case 'BOFU': return Zap;
      default: return Info;
    }
  };

  const getSectionStyle = (type: string) => {
    switch (type) {
      case 'TOFU':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50/50',
          badge: 'bg-blue-500/10 text-blue-700 border-blue-200',
          icon: 'text-blue-600'
        };
      case 'MOFU':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50/50',
          badge: 'bg-amber-500/10 text-amber-700 border-amber-200',
          icon: 'text-amber-600'
        };
      case 'BOFU':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50/50',
          badge: 'bg-green-500/10 text-green-700 border-green-200',
          icon: 'text-green-600'
        };
      default:
        return {
          border: 'border-border',
          bg: 'bg-muted/20',
          badge: 'bg-muted text-muted-foreground',
          icon: 'text-muted-foreground'
        };
    }
  };

  const getStageLabel = (type: string) => {
    switch (type) {
      case 'TOFU': return 'Getting Started';
      case 'MOFU': return 'Researching Options';
      case 'BOFU': return 'Ready to Buy';
      default: return 'Information';
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {sections.map((section, index) => {
        const Icon = getSectionIcon(section.type);
        const style = getSectionStyle(section.type);
        
        return (
          <Card 
            key={section.id}
            className={`p-6 md:p-8 ${style.border} ${style.bg}`}
          >
            {/* Section Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background/60 border ${style.border}`}>
                  <Icon className={`w-5 h-5 ${style.icon}`} />
                </div>
                <div>
                  <Badge variant="outline" className={`text-xs ${style.badge} mb-1`}>
                    {getStageLabel(section.type)}
                  </Badge>
                  <h2 
                    id={section.id}
                    className="text-xl md:text-2xl font-bold text-foreground"
                  >
                    {section.title}
                  </h2>
                </div>
              </div>
              
              {/* Section Number */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${style.badge} font-bold text-sm`}>
                {index + 1}
              </div>
            </div>

            {/* Section Content */}
            <div 
              className="prose prose-lg max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />

            {/* Section CTA */}
            {section.cta && (
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Next step in your property journey</span>
                </div>
                
                {section.cta.type === 'internal' ? (
                  <Button variant="outline" className="group" asChild>
                    <Link to={section.cta.href}>
                      {section.cta.text}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : section.cta.type === 'action' ? (
                  <Button className="group" asChild>
                    <Link to={section.cta.href}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {section.cta.text}
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="group" asChild>
                    <a href={section.cta.href} target="_blank" rel="noopener noreferrer">
                      {section.cta.text}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default FunnelStructuredContent;