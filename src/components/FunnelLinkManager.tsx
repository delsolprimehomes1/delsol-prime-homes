import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowRight, Link, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Article {
  id: string;
  title: string;
  slug: string;
  topic: string;
  funnel_stage: string;
  points_to_mofu_id?: string;
  points_to_bofu_id?: string;
  appointment_booking_enabled?: boolean;
}

export const FunnelLinkManager: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('qa_articles')
        .select('id, title, slug, topic, funnel_stage, points_to_mofu_id, points_to_bofu_id, appointment_booking_enabled')
        .order('funnel_stage')
        .order('topic')
        .order('title');

      if (error) throw error;

      setArticles(data || []);
      setFilteredArticles(data || []);
      
      // Extract unique topics
      const uniqueTopics = [...new Set((data || []).map(a => a.topic))];
      setTopics(uniqueTopics);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const linkArticles = async (sourceId: string, targetId: string, linkType: 'mofu' | 'bofu') => {
    try {
      const updateData = linkType === 'mofu' 
        ? { points_to_mofu_id: targetId }
        : { points_to_bofu_id: targetId };

      const { error } = await supabase
        .from('qa_articles')
        .update(updateData)
        .eq('id', sourceId);

      if (error) throw error;

      toast.success(`Successfully linked articles`);
      fetchArticles();
    } catch (error) {
      console.error('Error linking articles:', error);
      toast.error('Failed to link articles');
    }
  };

  const toggleBooking = async (articleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('qa_articles')
        .update({ appointment_booking_enabled: enabled })
        .eq('id', articleId);

      if (error) throw error;

      toast.success(`Booking ${enabled ? 'enabled' : 'disabled'}`);
      fetchArticles();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking setting');
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    let filtered = articles;

    if (selectedStage !== 'all') {
      filtered = filtered.filter(a => a.funnel_stage === selectedStage);
    }

    if (selectedTopic !== 'all') {
      filtered = filtered.filter(a => a.topic === selectedTopic);
    }

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  }, [articles, selectedStage, selectedTopic, searchTerm]);

  const getTargetArticles = (stage: string, topic: string) => {
    if (stage === 'TOFU') {
      return articles.filter(a => a.funnel_stage === 'MOFU');
    } else if (stage === 'MOFU') {
      return articles.filter(a => a.funnel_stage === 'BOFU');
    }
    return [];
  };

  const getLinkedArticle = (article: Article) => {
    if (article.funnel_stage === 'TOFU' && article.points_to_mofu_id) {
      return articles.find(a => a.id === article.points_to_mofu_id);
    } else if (article.funnel_stage === 'MOFU' && article.points_to_bofu_id) {
      return articles.find(a => a.id === article.points_to_bofu_id);
    }
    return null;
  };

  if (loading) {
    return <div className="p-6">Loading articles...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="TOFU">TOFU (Getting Started)</SelectItem>
                <SelectItem value="MOFU">MOFU (Research)</SelectItem>
                <SelectItem value="BOFU">BOFU (Decision)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="outline" className="justify-center">
              {filteredArticles.length} Articles
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Articles Management */}
      <div className="space-y-4">
        {filteredArticles.map((article) => {
          const linkedArticle = getLinkedArticle(article);
          const targetArticles = getTargetArticles(article.funnel_stage, article.topic);
          
          return (
            <Card key={article.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={
                        article.funnel_stage === 'TOFU' ? 'default' : 
                        article.funnel_stage === 'MOFU' ? 'secondary' : 'destructive'
                      }>
                        {article.funnel_stage}
                      </Badge>
                      <Badge variant="outline">{article.topic}</Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">/{article.slug}</p>
                    
                    {/* Current Link Status */}
                    <div className="flex items-center gap-2 mb-4">
                      {linkedArticle ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Link className="w-4 h-4" />
                          <ArrowRight className="w-4 h-4" />
                          <span className="font-medium">{linkedArticle.title}</span>
                        </div>
                      ) : article.funnel_stage === 'BOFU' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant={article.appointment_booking_enabled ? 'default' : 'destructive'}>
                            Booking {article.appointment_booking_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-orange-600">
                          <span>No {article.funnel_stage === 'TOFU' ? 'MOFU' : 'BOFU'} link</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {article.funnel_stage === 'BOFU' ? (
                      <Button
                        variant={article.appointment_booking_enabled ? 'destructive' : 'default'}
                        onClick={() => toggleBooking(article.id, !article.appointment_booking_enabled)}
                      >
                        {article.appointment_booking_enabled ? 'Disable Booking' : 'Enable Booking'}
                      </Button>
                    ) : (
                      <Select
                        value={linkedArticle?.id || ''}
                        onValueChange={(value) => {
                          if (value) {
                            linkArticles(
                              article.id, 
                              value, 
                              article.funnel_stage === 'TOFU' ? 'mofu' : 'bofu'
                            );
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Link to ${article.funnel_stage === 'TOFU' ? 'MOFU' : 'BOFU'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {targetArticles.map(target => (
                            <SelectItem key={target.id} value={target.id}>
                              {target.title} ({target.topic})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};