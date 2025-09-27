import React from 'react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface QASpacedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const QASpacedLayout: React.FC<QASpacedLayoutProps> = ({
  children,
  className = "",
}) => {
  const breakpoints = useResponsiveLayout();

  return (
    <div className={`qa-spaced-container ${className}`}>
      {/* Extra spacious container with proper max-widths */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Generous vertical spacing */}
        <div className="space-y-16 py-12 lg:py-20">
          {children}
        </div>
      </div>
    </div>
  );
};

export default QASpacedLayout;