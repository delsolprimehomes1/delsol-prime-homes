import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import BlogCard from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
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

interface BlogCategory {
  key: string;
  name: string;
  language: string;
}

const POSTS_PER_PAGE = 9;

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    fetchBlogData();
  }, [i18n.language, selectedCategory, searchTerm, currentPage]);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const currentLanguage = i18n.language || 'en';
      const offset = (currentPage - 1) * POSTS_PER_PAGE;

      // Build query
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('language', currentLanguage)
        .eq('status', 'published');

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_key', selectedCategory);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
      }

      // Apply pagination and ordering
      const { data: postsData, error: postsError, count } = await query
        .order('published_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (postsError) {
        console.error('Error fetching blog posts:', postsError);
        return;
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('key, name, language')
        .eq('language', currentLanguage)
        .order('sort_order');

      if (categoriesError) {
        console.error('Error fetching blog categories:', categoriesError);
        return;
      }

      setPosts(postsData || []);
      setCategories(categoriesData || []);
      setTotalPosts(count || 0);
    } catch (error) {
      console.error('Error in fetchBlogData:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryKey: string) => {
    const category = categories.find(cat => cat.key === categoryKey);
    return category?.name || categoryKey;
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const handleCategoryChange = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-accent/10">
      <title>{t('blog.pageTitle')} | Del Sol Prime Homes</title>
      <meta name="description" content={t('blog.pageDescription')} />
      <meta name="keywords" content="Costa del Sol blog, luxury real estate, Marbella properties, Estepona homes, investment guides" />
      <link rel="canonical" href="https://delsolprimehomes.com/blog" />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {t('blog.heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('blog.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder={t('blog.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-white/20 rounded-xl"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer px-4 py-2 transition-all duration-200 ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-white hover:bg-primary/90' 
                    : 'hover:bg-primary/10 hover:text-primary'
                }`}
                onClick={() => handleCategoryChange('all')}
              >
                {t('blog.allCategories')}
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.key}
                  variant={selectedCategory === category.key ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-2 transition-all duration-200 ${
                    selectedCategory === category.key 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'hover:bg-primary/10 hover:text-primary'
                  }`}
                  onClick={() => handleCategoryChange(category.key)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section ref={targetRef} className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(POSTS_PER_PAGE)].map((_, i) => (
                <div key={i} className="bg-muted rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className={`${isIntersecting ? 'animate-fade-in' : 'opacity-0'}`}
                  style={{ 
                    animationDelay: isIntersecting ? `${index * 100}ms` : '0ms'
                  }}
                >
                  <BlogCard 
                    post={post} 
                    categoryName={getCategoryName(post.category_key)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('blog.noPosts')}
              </h3>
              <p className="text-muted-foreground">
                {t('blog.noPostsDescription')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="pb-16 px-4">
          <div className="max-w-7xl mx-auto flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="bg-white/80 backdrop-blur-sm border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('blog.previous')}
              </Button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`min-w-10 ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'bg-white/80 backdrop-blur-sm border-white/20 hover:bg-primary/10'
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="bg-white/80 backdrop-blur-sm border-white/20"
              >
                {t('blog.next')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Blog;