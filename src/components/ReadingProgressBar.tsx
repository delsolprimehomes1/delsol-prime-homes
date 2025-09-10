import { useState, useEffect } from 'react';
import { trackReadingProgress } from '@/utils/analytics';
import { cn } from '@/lib/utils';

interface ReadingProgressBarProps {
  articleSlug: string;
  className?: string;
}

export const ReadingProgressBar = ({ articleSlug, className }: ReadingProgressBarProps) => {
  const [progress, setProgress] = useState(0);
  const [hasTracked25, setHasTracked25] = useState(false);
  const [hasTracked50, setHasTracked50] = useState(false);
  const [hasTracked75, setHasTracked75] = useState(false);
  const [hasTracked100, setHasTracked100] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progressPercentage = Math.min((scrolled / documentHeight) * 100, 100);
      
      setProgress(progressPercentage);

      // Track milestones
      if (progressPercentage >= 25 && !hasTracked25) {
        trackReadingProgress(articleSlug, 25);
        setHasTracked25(true);
      }
      if (progressPercentage >= 50 && !hasTracked50) {
        trackReadingProgress(articleSlug, 50);
        setHasTracked50(true);
      }
      if (progressPercentage >= 75 && !hasTracked75) {
        trackReadingProgress(articleSlug, 75);
        setHasTracked75(true);
      }
      if (progressPercentage >= 100 && !hasTracked100) {
        trackReadingProgress(articleSlug, 100);
        setHasTracked100(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articleSlug, hasTracked25, hasTracked50, hasTracked75, hasTracked100]);

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      <div 
        className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-all duration-300 ease-out shadow-lg shadow-primary/20"
        style={{ 
          width: `${progress}%`,
          boxShadow: progress > 0 ? `0 0 20px hsl(var(--primary) / 0.3)` : 'none'
        }}
      />
      
      {/* Optional: Reading progress indicator */}
      {progress > 5 && (
        <div className="absolute top-2 right-4 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-muted-foreground border border-border/50">
          {Math.round(progress)}% read
        </div>
      )}
    </div>
  );
};