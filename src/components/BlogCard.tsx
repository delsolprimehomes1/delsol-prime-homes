import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Calendar } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  image_alt: string;
  category_key: string;
  published_at: string;
  language: string;
}

interface BlogCardProps {
  post: BlogPost;
  categoryName: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, categoryName }) => {
  const { t } = useTranslation();
  const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateExcerpt = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <article 
      ref={targetRef as React.RefObject<HTMLElement>}
      className={`group h-full transition-all duration-500 ${
        isIntersecting ? 'animate-fade-in opacity-100' : 'opacity-0'
      }`}
    >
      <a 
        href={`/blog/${post.slug}`}
        aria-label={`Read ${post.title}`}
        className="block h-full bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:shadow-elegant hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        rel="prefetch"
      >
        <div className="relative overflow-hidden rounded-t-2xl aspect-video">
          <img
            src={post.featured_image}
            alt={post.image_alt}
            title={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {categoryName}
            </span>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              <time dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
            </div>
          </div>
          
          <h3 className="font-heading text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 group-hover:underline underline-offset-4">
            {post.title}
          </h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
            {truncateExcerpt(post.excerpt)}
          </p>
          
          <div className="flex items-center justify-between text-primary group-hover:text-primary/80 transition-colors duration-300 mt-auto">
            <span className="text-sm font-medium">
              {t('blog.readMore', 'Read More')}
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </a>
    </article>
  );
};

export default BlogCard;