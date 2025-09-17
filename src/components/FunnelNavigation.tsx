import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageSquare, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FunnelNavigationProps {
  currentStage: 'TOFU' | 'MOFU' | 'BOFU';
  nextStepUrl?: string;
  nextStepText?: string;
  className?: string;
}

export function FunnelNavigation({ 
  currentStage, 
  nextStepUrl, 
  nextStepText,
  className = '' 
}: FunnelNavigationProps) {
  const stageConfig = {
    TOFU: {
      name: 'Getting Started',
      description: 'Learn the basics',
      icon: FileText,
      color: 'bg-blue-100 text-blue-800',
      nextDefault: { url: '/qa?stage=MOFU', text: 'Explore detailed guides' }
    },
    MOFU: {
      name: 'Deep Dive',
      description: 'Detailed information',
      icon: Users,
      color: 'bg-orange-100 text-orange-800',
      nextDefault: { url: '/qa?stage=BOFU', text: 'Ready to take action?' }
    },
    BOFU: {
      name: 'Ready to Act',
      description: 'Decision time',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-800',
      nextDefault: { url: '/book-viewing', text: 'Chat with our AI advisor' }
    }
  };

  const config = stageConfig[currentStage];
  const IconComponent = config.icon;
  
  const finalNextStepUrl = nextStepUrl || config.nextDefault.url;
  const finalNextStepText = nextStepText || config.nextDefault.text;

  return (
    <Card className={`border-l-4 border-l-primary ${className}`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              <Badge className={config.color}>
                {config.name}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {config.description}
            </span>
          </div>
          
          <Button asChild variant="default" className="group">
            <Link to={finalNextStepUrl} className="flex items-center gap-2">
              {finalNextStepText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        <div className="mt-3 flex gap-1">
          {(['TOFU', 'MOFU', 'BOFU'] as const).map((stage, index) => (
            <div 
              key={stage}
              className={`flex-1 h-2 rounded-full ${
                stage === currentStage 
                  ? 'bg-primary' 
                  : index < ['TOFU', 'MOFU', 'BOFU'].indexOf(currentStage)
                  ? 'bg-primary/60'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}