import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Phone, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NextStep {
  title: string;
  description: string;
  icon: 'calendar' | 'phone' | 'message';
  action: string;
  url: string;
  variant?: 'default' | 'secondary' | 'outline';
}

interface BlogNextStepsProps {
  title?: string;
  description?: string;
  steps: NextStep[];
  className?: string;
}

export const BlogNextSteps: React.FC<BlogNextStepsProps> = ({
  title = 'Ready to Take the Next Step?',
  description = 'Let our expert team guide you through your property journey on the Costa del Sol.',
  steps,
  className = ''
}) => {
  const navigate = useNavigate();

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'calendar':
        return <Calendar className="w-5 h-5" />;
      case 'phone':
        return <Phone className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <ArrowRight className="w-5 h-5" />;
    }
  };

  const handleAction = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  return (
    <Card className={`p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          {title}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div 
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              {getIcon(step.icon)}
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              {step.description}
            </p>
            <Button
              variant={step.variant || 'default'}
              onClick={() => handleAction(step.url)}
              className="w-full group"
            >
              {step.action}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BlogNextSteps;
