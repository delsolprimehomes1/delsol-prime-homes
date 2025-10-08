import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentlyUpdatedWidgetProps {
  language?: string;
  limit?: number;
  contentType?: 'qa' | 'blog' | 'both';
}

export function RecentlyUpdatedWidget({ 
  language = 'en', 
  limit = 10,
  contentType = 'qa' 
}: RecentlyUpdatedWidgetProps) {
  
  const { data: articles, isLoading } = useQuery({
    queryKey: ['recently-updated', language, contentType],
    queryFn: async () => {
      if (contentType === 'qa' || contentType === 'both') {
        const { data } = await supabase
          .from('qa_articles')
          .select('id, title, slug, updated_at, topic, funnel_stage, language')
          .eq('language', language)
          .eq('published', true)
          .order('updated_at', { ascending: false })
          .limit(limit);
        return data || [];
      }
      
      if (contentType === 'blog') {
        const { data } = await supabase
          .from('blog_posts')
          .select('id, title, slug, updated_at, category_key, funnel_stage, language')
          .eq('language', language)
          .eq('status', 'published')
          .order('updated_at', { ascending: false })
          .limit(limit);
        return data?.map(post => ({
          ...post,
          topic: post.category_key
        })) || [];
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading || !articles || articles.length === 0) {
    return null;
  }

  const stageColors = {
    TOFU: 'bg-blue-500/10 text-blue-600',
    MOFU: 'bg-orange-500/10 text-orange-600',
    BOFU: 'bg-green-500/10 text-green-600'
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffDays = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return updated.toLocaleDateString();
  };

  return (
    <Card className="bg-navy/5 rounded-lg p-6 mb-6 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gold" />
        <h2 className="text-xl font-playfair font-bold text-navy">
          Recently Updated
        </h2>
      </div>
      
      <div className="space-y-3">
        {articles.map((article: any) => (
          <Link
            key={article.id}
            to={`/${language}/${contentType === 'blog' ? 'blog' : 'qa'}/${article.slug}`}
            className="block p-3 rounded-lg hover:bg-white transition-colors group"
          >
            <div className="flex items-start gap-3">
              <span className="text-xs text-gold font-medium px-2 py-1 bg-gold/10 rounded whitespace-nowrap mt-0.5">
                {formatDate(article.updated_at)}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy line-clamp-2 group-hover:text-gold transition-colors text-sm mb-1">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{article.topic}</span>
                  {article.funnel_stage && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${stageColors[article.funnel_stage as keyof typeof stageColors]}`}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {article.funnel_stage}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
