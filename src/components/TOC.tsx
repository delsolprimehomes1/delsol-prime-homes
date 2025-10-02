import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/useResponsiveLayout';
import { BookOpen, ChevronRight, ChevronDown } from 'lucide-react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TOCProps {
  content: string;
  className?: string;
}

export const TOC: React.FC<TOCProps> = ({ content, className = '' }) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Extract H2 and H3 headings from markdown
  useEffect(() => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    
    const items: TOCItem[] = matches.map((match, index) => {
      const level = match[1].length;
      const title = match[2].trim().replace(/\*\*/g, ''); // Remove markdown bold
      
      // Create ID from title
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      return { id, title, level };
    });

    setTocItems(items);
  }, [content]);

  // Track active section with Intersection Observer
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

    // Observe all H2 and H3 headings
    const headings = document.querySelectorAll('h2, h3');
    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      // Close mobile TOC after clicking
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  const getIndentClass = (level: number) => {
    return level === 2 ? 'pl-0' : 'pl-6';
  };

  if (tocItems.length === 0) {
    return null;
  }

  // Mobile Collapsible TOC
  if (isMobile) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <CardTitle className="text-base">Table of Contents</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {tocItems.length}
                  </Badge>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToHeading(item.id)}
                    className={`
                      w-full text-left py-2 px-3 rounded-md transition-all duration-200
                      hover:bg-muted/50 text-sm
                      ${getIndentClass(item.level)}
                      ${activeId === item.id 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  // Desktop Sticky TOC
  return (
    <div className={`sticky top-24 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <CardTitle className="text-base">Table of Contents</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`
                  w-full text-left py-2 px-2 rounded-md transition-all duration-200
                  hover:bg-muted/50 text-sm group
                  ${getIndentClass(item.level)}
                  ${activeId === item.id 
                    ? 'bg-primary/10 text-primary border-l-2 border-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="line-clamp-2">{item.title}</span>
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
