import React, { useState, useEffect } from 'react';

interface BlogReadingProgressProps {
  className?: string;
}

export const BlogReadingProgress: React.FC<BlogReadingProgressProps> = ({
  className = ''
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const percentage = (scrollTop / trackLength) * 100;
      
      setProgress(Math.min(100, Math.max(0, percentage)));
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div className="h-1 bg-muted/30 backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-primary via-primary/80 to-accent transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default BlogReadingProgress;
