// Analytics utilities for FAQ funnel tracking
interface AnalyticsEvent {
  event: string;
  data: Record<string, any>;
}

// Track funnel progression events
export const trackFunnelEvent = (fromStage: string, toStage: string, questionSlug: string) => {
  const eventData = {
    from_stage: fromStage,
    to_stage: toStage,
    question_slug: questionSlug,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    page_url: window.location.href
  };

  // Log to console for debugging
  console.log('Funnel Event:', eventData);

  // Send to Google Analytics 4 if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'funnel_next_step', {
      custom_map: {
        from_stage: fromStage,
        to_stage: toStage,
        question_slug: questionSlug
      }
    });
  }

  // Send to other analytics platforms as needed
  // Example: Mixpanel, Segment, etc.
};

// Track reading progress
export const trackReadingProgress = (questionSlug: string, progressPercentage: number) => {
  if (progressPercentage % 25 === 0) { // Track at 25%, 50%, 75%, 100%
    const eventData = {
      question_slug: questionSlug,
      progress: progressPercentage,
      timestamp: new Date().toISOString()
    };

    console.log('Reading Progress:', eventData);

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'reading_progress', {
        custom_map: {
          question_slug: questionSlug,
          progress: progressPercentage
        }
      });
    }
  }
};

// Track CTA clicks
export const trackCTAClick = (ctaType: string, ctaText: string, destination: string) => {
  const eventData = {
    cta_type: ctaType,
    cta_text: ctaText,
    destination: destination,
    timestamp: new Date().toISOString(),
    page_url: window.location.href
  };

  console.log('CTA Click:', eventData);

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'cta_click', {
      custom_map: {
        cta_type: ctaType,
        cta_text: ctaText,
        destination: destination
      }
    });
  }
};

// Track funnel progression between stages
export const trackFunnelProgression = (fromStage: string, toStage: string, questionSlug: string) => {
  const eventData = {
    from_stage: fromStage,
    to_stage: toStage,
    question_slug: questionSlug,
    timestamp: new Date().toISOString(),
    page_url: window.location.href
  };

  console.log('Funnel Progression:', eventData);

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'funnel_progression', {
      custom_map: {
        from_stage: fromStage,
        to_stage: toStage,
        question_slug: questionSlug
      }
    });
  }
};

// Track BOFU conversion events
export const trackFunnelConversion = (conversionType: string, questionSlug: string) => {
  const eventData = {
    conversion_type: conversionType,
    question_slug: questionSlug,
    timestamp: new Date().toISOString(),
    page_url: window.location.href
  };

  console.log('Funnel Conversion:', eventData);

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'funnel_conversion', {
      custom_map: {
        conversion_type: conversionType,
        question_slug: questionSlug
      }
    });
  }
};

// Generic analytics event tracker
export const trackEvent = (event: string, data: Record<string, any>) => {
  const eventData = {
    event,
    ...data,
    timestamp: new Date().toISOString(),
    page_url: window.location.href
  };

  console.log('Analytics Event:', eventData);

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, {
      custom_map: data
    });
  }
};