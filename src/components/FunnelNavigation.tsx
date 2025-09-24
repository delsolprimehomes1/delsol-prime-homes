import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageSquare, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackCTAClick, trackFunnelProgression } from '@/utils/analytics';

interface FunnelNavigationProps {
  currentStage: 'exploration' | 'research' | 'decision';
  nextStepUrl?: string;
  nextStepText?: string;
  className?: string;
  // Add linked article data
  nextMofuArticle?: { slug: string; title: string } | null;
  nextBofuArticle?: { slug: string; title: string } | null;
}

export function FunnelNavigation({ 
  currentStage, 
  nextStepUrl, 
  nextStepText,
  nextMofuArticle,
  nextBofuArticle,
  className = '' 
}: FunnelNavigationProps) {
  const stageConfig = {
    exploration: {
      name: 'Getting Started',
      description: 'Learn the basics',
      icon: FileText,
      color: 'bg-blue-100 text-blue-800',
      nextDefault: { url: '/qa?stage=research', text: 'Explore detailed guides' }
    },
    research: {
      name: 'Deep Dive',
      description: 'Detailed information',
      icon: Users,
      color: 'bg-orange-100 text-orange-800',
      nextDefault: { url: '/qa?stage=decision', text: 'Ready to take action?' }
    },
    decision: {
      name: 'Ready to Act',
      description: 'Decision time',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-800',
      nextDefault: { url: '/book-viewing', text: 'Chat with our AI advisor' }
    }
  };

  const config = stageConfig[currentStage];
  
  // Fallback if stage doesn't match - this prevents the error
  if (!config) {
    console.warn(`Unknown stage "${currentStage}" in FunnelNavigation. Using exploration as fallback.`);
    const fallbackConfig = stageConfig['exploration'];
    const IconComponent = fallbackConfig.icon;
    
    const finalNextStepUrl = nextStepUrl || fallbackConfig.nextDefault.url;
    const finalNextStepText = nextStepText || fallbackConfig.nextDefault.text;

    return (
      <Card className={`border-l-4 border-l-primary ${className}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <IconComponent className="h-5 w-5" />
                <Badge className={fallbackConfig.color}>
                  {fallbackConfig.name} (Unknown: {currentStage})
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {fallbackConfig.description}
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
            {(['exploration', 'research', 'decision'] as const).map((stage, index) => (
              <div 
                key={stage}
                className={`flex-1 h-2 rounded-full ${
                  stage === 'exploration'
                    ? 'bg-primary' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = config.icon;
  
  // Determine next step based on funnel stage and available links
  let finalNextStepUrl = nextStepUrl;
  let finalNextStepText = nextStepText;
  
  if (!finalNextStepUrl) {
    if (currentStage === 'exploration' && nextMofuArticle) {
      // TOFU article linking to specific MOFU article with compelling preview
      finalNextStepUrl = `/qa/${nextMofuArticle.slug}`;
      
      // Enhanced preview with topic-aware copy and extended character limit
      let enhancedPreview = nextMofuArticle.title;
      
      // Add topic-specific enhancements for better engagement
      if (nextMofuArticle.title.toLowerCase().includes('golf') || 
          nextMofuArticle.title.toLowerCase().includes('lifestyle')) {
        enhancedPreview = nextMofuArticle.title.includes('UK') || nextMofuArticle.title.includes('Irish') 
          ? nextMofuArticle.title 
          : `${nextMofuArticle.title} (for UK & Irish expats)`;
      }
      
      // Extended character limit for better previews (70 chars instead of 40)
      const previewTitle = enhancedPreview.length > 70 
        ? enhancedPreview.substring(0, 67) + '...' 
        : enhancedPreview;
      
      // Always use specific article preview, never fallback when article exists
      finalNextStepText = `Next: ${previewTitle} →`;
    } else if (currentStage === 'research' && nextBofuArticle) {
      // MOFU article linking to specific BOFU article with action-focused copy
      finalNextStepUrl = `/qa/${nextBofuArticle.slug}`;
      
      // Enhanced action-focused copy based on article content
      let actionTitle;
      if (nextBofuArticle.title.toLowerCase().includes('buy') || nextBofuArticle.title.toLowerCase().includes('purchase')) {
        actionTitle = 'Final steps before buying →';
      } else if (nextBofuArticle.title.toLowerCase().includes('invest')) {
        actionTitle = 'What to confirm before investing →';
      } else if (nextBofuArticle.title.toLowerCase().includes('legal')) {
        actionTitle = 'Legal essentials for expats →';
      } else {
        actionTitle = `Ready: ${nextBofuArticle.title.substring(0, 35)}... →`;
      }
      
      finalNextStepText = actionTitle;
    } else if (currentStage === 'decision') {
      // BOFU articles should lead to booking with urgency
      finalNextStepUrl = '/book-viewing';
      finalNextStepText = 'Your dream home awaits — book now →';
    } else {
      // Only use fallback when no specific articles are available
      finalNextStepUrl = config.nextDefault.url;
      const enhancedDefault = currentStage === 'exploration' 
        ? 'Explore expert research guides →'
        : currentStage === 'research'
        ? 'Ready to take action? →'
        : 'Schedule your consultation →';
      finalNextStepText = enhancedDefault;
    }
  }

  const handleCTAClick = () => {
    // Track CTA click with funnel progression analytics
    const ctaType = currentStage === 'exploration' ? 'tofu_navigation' : 
                   currentStage === 'research' ? 'mofu_navigation' : 'bofu_navigation';
    
    trackCTAClick(ctaType, finalNextStepText, finalNextStepUrl);
    
    // Track funnel progression if moving between stages
    if (currentStage === 'exploration' && nextMofuArticle) {
      trackFunnelProgression('TOFU', 'MOFU', nextMofuArticle.slug);
    } else if (currentStage === 'research' && nextBofuArticle) {
      trackFunnelProgression('MOFU', 'BOFU', nextBofuArticle.slug);
    } else if (currentStage === 'decision') {
      trackFunnelProgression('BOFU', 'CONVERSION', finalNextStepUrl);
    }
  };

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
              <Link 
                to={finalNextStepUrl} 
                className="flex items-center gap-2"
                onClick={handleCTAClick}
              >
              {finalNextStepText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        <div className="mt-3 flex gap-1">
          {(['exploration', 'research', 'decision'] as const).map((stage, index) => (
            <div 
              key={stage}
              className={`flex-1 h-2 rounded-full ${
                stage === currentStage 
                  ? 'bg-primary' 
                  : index < ['exploration', 'research', 'decision'].indexOf(currentStage)
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