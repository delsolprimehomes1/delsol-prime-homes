import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight } from 'lucide-react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TOCStickyProps {
  content: string;
  className?: string;
}

export const TOCSticky: React.FC<TOCStickyProps> = ({
  content,
  className = ''
}) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Extract headings from content
  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    
    const items: TOCItem[] = matches.map((match, index) => ({
      id: `heading-${index}`,
      title: match[2].trim(),
      level: match[1].length
    }));

    setTocItems(items);
  }, [content]);

  // Track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    );

    // Observe all headings
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1: return 'pl-0';
      case 2: return 'pl-4';
      case 3: return 'pl-8';
      default: return 'pl-0';
    }
  };

  const getFontSizeClass = (level: number) => {
    switch (level) {
      case 1: return 'text-sm font-semibold';
      case 2: return 'text-sm';
      case 3: return 'text-xs';
      default: return 'text-sm';
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className={`sticky top-24 ${className}`}>
      <Card className="w-64">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <CardTitle className="text-base">Table of Contents</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <nav className="space-y-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`
                  w-full text-left py-2 px-2 rounded-md transition-all duration-200
                  hover:bg-muted/50 group
                  ${getIndentClass(item.level)}
                  ${getFontSizeClass(item.level)}
                  ${activeId === item.id 
                    ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="line-clamp-2 text-left">
                    {item.title}
                  </span>
                  {activeId === item.id && (
                    <ChevronRight className="h-3 w-3 text-primary flex-shrink-0 ml-1" />
                  )}
                </div>
              </button>
            ))}
          </nav>
          
          <div className="mt-4 pt-3 border-t">
            <Badge variant="outline" className="text-xs">
              {tocItems.length} sections
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};