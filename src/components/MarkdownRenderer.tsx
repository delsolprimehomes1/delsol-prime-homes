import React, { useEffect, useRef } from 'react';
import { processMarkdownContent } from '@/utils/markdown';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  // Process markdown and add heading IDs + speakable classes
  useEffect(() => {
    if (!containerRef.current) return;

    // Add IDs to all headings for anchor linking
    const headings = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      if (!heading.id) {
        const text = heading.textContent || '';
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        heading.id = id;
      }
      
      // Add smooth scroll behavior
      heading.classList.add('scroll-mt-24');
      
      // Add speakable class to questions (headings ending with ?)
      if (heading.textContent?.endsWith('?')) {
        heading.classList.add('speakable-content');
        heading.setAttribute('data-speakable', 'true');
      }
    });

    // Add speakable classes to paragraphs with 40-60 words
    const paragraphs = containerRef.current.querySelectorAll('p');
    paragraphs.forEach((p) => {
      const text = p.textContent || '';
      const wordCount = text.trim().split(/\s+/).length;
      
      if (wordCount >= 40 && wordCount <= 60) {
        p.classList.add('speakable-content');
        p.setAttribute('data-speakable', 'true');
      }
    });

    // Add external link icons
    const links = containerRef.current.querySelectorAll('a[href^="http"]');
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href.includes('delsolprimehomes.com')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.classList.add('external-link');
        
        // Add icon if not already present
        if (!link.querySelector('.external-icon')) {
          const icon = document.createElement('span');
          icon.className = 'external-icon inline-block ml-1 align-middle';
          icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
          link.appendChild(icon);
        }
      }
    });

    // Lazy load images with Intersection Observer
    const images = containerRef.current.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
          }
          
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    images.forEach((img) => {
      img.classList.add('lazy-image');
      
      // Add responsive attributes
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Validate alt text
      if (!img.alt || img.alt.trim() === '') {
        console.warn('Image missing alt text:', img.src);
        img.alt = 'Costa del Sol Property Image';
      }
      
      imageObserver.observe(img);
    });

    return () => {
      imageObserver.disconnect();
    };
  }, [content]);

  return (
    <div 
      ref={(el) => {
        containerRef.current = el;
        (targetRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className={`
        prose prose-lg max-w-none
        prose-headings:font-heading prose-headings:text-foreground prose-headings:font-bold
        prose-h1:text-4xl prose-h1:leading-tight prose-h1:mb-6
        prose-h2:text-3xl prose-h2:leading-tight prose-h2:mt-12 prose-h2:mb-4
        prose-h3:text-2xl prose-h3:leading-snug prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
        prose-strong:text-foreground prose-strong:font-semibold
        prose-li:text-muted-foreground prose-li:leading-relaxed
        prose-ul:space-y-2 prose-ol:space-y-2
        prose-img:rounded-lg prose-img:shadow-md prose-img:w-full
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
        prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded
        ${isIntersecting ? 'animate-in fade-in duration-500' : 'opacity-0'}
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: processMarkdownContent(content) }}
    />
  );
};
