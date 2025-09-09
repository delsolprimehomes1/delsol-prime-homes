import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const { t } = useTranslation();
  
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors duration-200"
        aria-label={t('nav.home')}
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          {item.href && !item.current ? (
            <Link 
              to={item.href}
              className="hover:text-foreground transition-colors duration-200 truncate max-w-[200px]"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={cn(
                "truncate max-w-[200px]",
                item.current && "text-foreground font-medium"
              )}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Generate breadcrumb JSON-LD schema
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[], baseUrl: string = 'https://delsolprimehomes.com') {
  const itemListElements = items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 2, // +2 because Home is position 1
    "name": item.label,
    "item": item.href ? `${baseUrl}${item.href}` : undefined
  }));

  // Add Home as first item
  itemListElements.unshift({
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": baseUrl
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElements
  };
}