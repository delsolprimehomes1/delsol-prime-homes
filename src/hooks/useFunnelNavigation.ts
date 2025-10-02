import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getNextFunnelArticle } from '@/utils/topic-aware-linking';

interface NextStepData {
  title: string;
  slug?: string;
  url?: string;
  cta?: string;
  preview?: string;
  funnelStage?: 'TOFU' | 'MOFU' | 'BOFU';
}

interface UseFunnelNavigationOptions {
  slug: string;
  topic: string;
  funnelStage: string;
  language?: string;
  pointsToMofuId?: string;
  pointsToBofuId?: string;
  markdownFrontmatter?: any;
}

export const useFunnelNavigation = (options: UseFunnelNavigationOptions) => {
  const [nextStep, setNextStep] = useState<NextStepData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNextStep = async () => {
      try {
        setIsLoading(true);

        // Get the current article details
        const { data: currentArticle } = await supabase
          .from('qa_articles')
          .select('next_step, points_to_mofu_id, points_to_bofu_id, markdown_frontmatter')
          .eq('slug', options.slug)
          .eq('language', options.language || 'en')
          .single();

        // Priority 1: Check if next_step JSONB field exists
        if (currentArticle?.next_step) {
          const nextStepData = currentArticle.next_step as any;
          setNextStep({
            title: nextStepData.title,
            slug: nextStepData.slug,
            url: nextStepData.url,
            cta: nextStepData.cta,
            preview: nextStepData.preview,
            funnelStage: nextStepData.funnelStage,
          });
          setIsLoading(false);
          return;
        }

        // Priority 2: Use topic-aware linking system
        const result = await getNextFunnelArticle(
          {
            topic: options.topic,
            funnel_stage: options.funnelStage,
            points_to_mofu_id: currentArticle?.points_to_mofu_id,
            points_to_bofu_id: currentArticle?.points_to_bofu_id,
            markdown_frontmatter: currentArticle?.markdown_frontmatter,
          },
          options.language || 'en'
        );

        // Determine which article to use based on current stage
        let targetArticle = null;
        if (options.funnelStage === 'TOFU' && result.nextMofuArticle) {
          targetArticle = result.nextMofuArticle;
        } else if (options.funnelStage === 'MOFU' && result.nextBofuArticle) {
          targetArticle = result.nextBofuArticle;
        } else if (result.frontmatterNextStep) {
          targetArticle = result.frontmatterNextStep;
        }

        if (targetArticle) {
          setNextStep({
            title: targetArticle.title,
            slug: targetArticle.slug,
            funnelStage: targetArticle.topic ? undefined : 'MOFU',
            cta: options.funnelStage === 'TOFU' ? 'Learn More' : 
                 options.funnelStage === 'MOFU' ? 'Take Action' : 
                 'Get Started',
          });
        } else {
          // Fallback: Generic next step based on current stage
          setNextStep(getGenericNextStep(options.funnelStage));
        }
      } catch (error) {
        console.error('Error fetching next step:', error);
        setNextStep(getGenericNextStep(options.funnelStage));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextStep();
  }, [options.slug, options.topic, options.funnelStage, options.language]);

  return { nextStep, isLoading };
};

function getGenericNextStep(currentStage: string): NextStepData {
  switch (currentStage) {
    case 'TOFU':
      return {
        title: 'Explore Property Areas',
        url: '/qa',
        cta: 'Browse All Questions',
        funnelStage: 'MOFU',
        preview: 'Discover detailed insights about different areas and property types.',
      };
    case 'MOFU':
      return {
        title: 'Book a Property Viewing',
        url: '/book-viewing',
        cta: 'Schedule Now',
        funnelStage: 'BOFU',
        preview: 'Ready to see properties in person? Schedule a viewing with our experts.',
      };
    case 'BOFU':
      return {
        title: 'Contact Our Team',
        url: '/book-viewing',
        cta: 'Get in Touch',
        preview: 'Speak directly with our property experts about your requirements.',
      };
    default:
      return {
        title: 'Explore More',
        url: '/qa',
        cta: 'Continue Reading',
        preview: 'Discover more insights about Costa del Sol properties.',
      };
  }
}
