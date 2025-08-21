import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { supabase } from '@/integrations/supabase/client';
import BlogCard from './BlogCard';

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

interface BlogCategory {
  key: string;
  name: string;
  language: string;
}

const BlogSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        const currentLanguage = i18n.language || 'en';

        // Fetch latest 3 blog posts
        const { data: postsData, error: postsError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('language', currentLanguage)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);

        if (postsError) {
          console.error('Error fetching blog posts:', postsError);
          return;
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('blog_categories')
          .select('key, name, language')
          .eq('language', currentLanguage);

        if (categoriesError) {
          console.error('Error fetching blog categories:', categoriesError);
          return;
        }

        setPosts(postsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error in fetchBlogData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [i18n.language]);

  const getCategoryName = (categoryKey: string) => {
    const category = categories.find(cat => cat.key === categoryKey);
    return category?.name || categoryKey;
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-background via-background/90 to-accent/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section 
      ref={targetRef}
      className={`py-20 px-4 bg-gradient-to-br from-background via-background/90 to-accent/10 transition-all duration-700 ${
        isIntersecting ? 'animate-fade-in opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              {t('blog.sectionTitle')}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('blog.sectionSubtitle')}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className={`${isIntersecting ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ 
                animationDelay: isIntersecting ? `${index * 200}ms` : '0ms'
              }}
            >
              <BlogCard 
                post={post} 
                categoryName={getCategoryName(post.category_key)}
              />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full font-semibold text-lg group shadow-elegant hover:shadow-primary/20 hover:shadow-xl transition-all duration-300"
            asChild
          >
            <a href="/blog">
              {t('blog.viewAllArticles')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;