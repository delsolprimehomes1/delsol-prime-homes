import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  funnel_stage: string;
  reading_time_minutes: number;
  category_key: string;
  published_at: string;
}

interface RelatedPostsProps {
  currentPostId?: string;
  currentFunnelStage?: string;
  currentTags?: string[];
  language?: string;
  className?: string;
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({
  currentPostId,
  currentFunnelStage = 'TOFU',
  currentTags = [],
  language = 'en',
  className = ''
}) => {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedPosts();
  }, [currentPostId, currentFunnelStage, language]);

  const fetchRelatedPosts = async () => {
    try {
      // Get next funnel stage posts first
      const nextStage = getNextFunnelStage(currentFunnelStage);
      
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('language', language)
        .eq('status', 'published')
        .neq('id', currentPostId || '')
        .order('published_at', { ascending: false })
        .limit(3);

      // Prioritize next funnel stage
      if (nextStage) {
        query = query.eq('funnel_stage', nextStage);
      }

      const { data: nextStagePosts, error: nextStageError } = await query;

      if (nextStageError) throw nextStageError;

      let posts = nextStagePosts || [];

      // If we need more posts, get from same stage or other stages
      if (posts.length < 3) {
        const remainingCount = 3 - posts.length;
        
        const { data: morePosts, error: morePostsError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('language', language)
          .eq('status', 'published')
          .neq('id', currentPostId || '')
          .not('id', 'in', `(${posts.map(p => p.id).join(',')})`)
          .order('published_at', { ascending: false })
          .limit(remainingCount);

        if (morePostsError) throw morePostsError;

        posts = [...posts, ...(morePosts || [])];
      }

      setRelatedPosts(posts);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      setRelatedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getNextFunnelStage = (currentStage: string): string | null => {
    switch (currentStage) {
      case 'TOFU':
        return 'MOFU';
      case 'MOFU':
        return 'BOFU';
      default:
        return null;
    }
  };

  const getFunnelStageColor = (stage: string) => {
    switch (stage) {
      case 'TOFU':
        return 'bg-blue-100 text-blue-800';
      case 'MOFU':
        return 'bg-yellow-100 text-yellow-800';
      case 'BOFU':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateExcerpt = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-xl font-semibold">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Continue Your Journey</h3>
        {getNextFunnelStage(currentFunnelStage) && (
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Next Step: {getNextFunnelStage(currentFunnelStage)}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
            <div className="relative overflow-hidden rounded-t-lg">
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge className={getFunnelStageColor(post.funnel_stage)}>
                  {post.funnel_stage}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {truncateExcerpt(post.excerpt)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.reading_time_minutes || 5} min</span>
                  </div>
                  <span>
                    {new Date(post.published_at).toLocaleDateString()}
                  </span>
                </div>
                
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between p-0 h-auto hover:bg-transparent hover:text-primary"
                >
                  <Link to={`/blog/${post.slug}`} className="flex items-center justify-between w-full py-2">
                    <span>Read Article</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel Journey Indicator */}
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Your Journey:</span>
          <div className="flex items-center gap-2">
            <Badge variant={currentFunnelStage === 'TOFU' ? 'default' : 'outline'}>
              Awareness
            </Badge>
            <ArrowRight className="h-3 w-3" />
            <Badge variant={currentFunnelStage === 'MOFU' ? 'default' : 'outline'}>
              Consideration
            </Badge>
            <ArrowRight className="h-3 w-3" />
            <Badge variant={currentFunnelStage === 'BOFU' ? 'default' : 'outline'}>
              Decision
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};