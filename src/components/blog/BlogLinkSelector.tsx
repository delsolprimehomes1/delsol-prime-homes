import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ArrowRight, Link2 } from 'lucide-react';

interface BlogLink {
  targetId: string;
  targetType: 'QA' | 'Blog';
  relation: string;
}

interface QAArticle {
  id: string;
  title: string;
  slug: string;
  funnel_stage: string;
  topic: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  funnel_stage: string;
}

interface BlogLinkSelectorProps {
  currentStage: 'TOFU' | 'MOFU' | 'BOFU';
  links: BlogLink[];
  onChange: (links: BlogLink[]) => void;
}

export function BlogLinkSelector({ currentStage, links, onChange }: BlogLinkSelectorProps) {
  const { toast } = useToast();
  const [qaArticles, setQaArticles] = useState<QAArticle[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedTargetType, setSelectedTargetType] = useState<'QA' | 'Blog'>('QA');
  const [selectedRelation, setSelectedRelation] = useState('');

  useEffect(() => {
    fetchQAArticles();
    fetchBlogPosts();
  }, []);

  const fetchQAArticles = async () => {
    const { data, error } = await supabase
      .from('qa_articles')
      .select('id, title, slug, funnel_stage, topic')
      .order('funnel_stage', { ascending: true })
      .order('title', { ascending: true });

    if (!error && data) {
      setQaArticles(data);
    }
  };

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, funnel_stage')
      .eq('status', 'published')
      .order('funnel_stage', { ascending: true })
      .order('title', { ascending: true });

    if (!error && data) {
      setBlogPosts(data);
    }
  };

  const getRelationOptions = () => {
    return [
      { value: 'expands', label: 'Expands on this topic' },
      { value: 'prerequisite', label: 'Prerequisite reading' },
      { value: 'next-step', label: 'Next step in journey' },
      { value: 'related', label: 'Related topic' },
      { value: 'alternative', label: 'Alternative approach' },
      { value: 'deep-dive', label: 'Deep dive into detail' },
      { value: 'comparison', label: 'Comparison/contrast' }
    ];
  };

  const addLink = () => {
    if (!selectedTargetId || !selectedRelation) {
      toast({
        title: 'Missing Information',
        description: 'Please select a target and relation type',
        variant: 'destructive'
      });
      return;
    }

    const newLink: BlogLink = {
      targetId: selectedTargetId,
      targetType: selectedTargetType,
      relation: selectedRelation
    };

    onChange([...links, newLink]);
    
    // Reset selections
    setSelectedTargetId('');
    setSelectedRelation('');
    
    toast({
      title: 'Link Added',
      description: 'Funnel relationship created successfully'
    });
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    onChange(newLinks);
  };

  const getLinkTitle = (link: BlogLink) => {
    if (link.targetType === 'QA') {
      const qa = qaArticles.find(q => q.id === link.targetId);
      return qa?.title || 'Unknown QA';
    } else {
      const blog = blogPosts.find(b => b.id === link.targetId);
      return blog?.title || 'Unknown Blog';
    }
  };

  const getLinkStage = (link: BlogLink) => {
    if (link.targetType === 'QA') {
      const qa = qaArticles.find(q => q.id === link.targetId);
      return qa?.funnel_stage || 'Unknown';
    } else {
      const blog = blogPosts.find(b => b.id === link.targetId);
      return blog?.funnel_stage || 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual Journey Preview */}
      {links.length > 0 && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium mb-3">Content Journey Preview</h4>
          <div className="space-y-2">
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{currentStage}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{getLinkStage(link)}</Badge>
                <span className="text-muted-foreground">({link.relation})</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeLink(idx)}
                  className="ml-auto"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Funnel Link</CardTitle>
          <CardDescription>
            Connect this {currentStage} blog to other content in the buyer journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={selectedTargetType} onValueChange={(v) => setSelectedTargetType(v as 'QA' | 'Blog')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="QA">Link to QA Article</TabsTrigger>
              <TabsTrigger value="Blog">Link to Blog Post</TabsTrigger>
            </TabsList>

            <TabsContent value="QA" className="space-y-4">
              <div className="space-y-2">
                <Label>Select QA Article</Label>
                <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose QA article..." />
                  </SelectTrigger>
                  <SelectContent>
                    {qaArticles.map((qa) => (
                      <SelectItem key={qa.id} value={qa.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {qa.funnel_stage}
                          </Badge>
                          <span className="text-sm">{qa.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="Blog" className="space-y-4">
              <div className="space-y-2">
                <Label>Select Blog Post</Label>
                <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose blog post..." />
                  </SelectTrigger>
                  <SelectContent>
                    {blogPosts.map((blog) => (
                      <SelectItem key={blog.id} value={blog.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {blog.funnel_stage}
                          </Badge>
                          <span className="text-sm">{blog.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label>Relationship Type</Label>
            <Select value={selectedRelation} onValueChange={setSelectedRelation}>
              <SelectTrigger>
                <SelectValue placeholder="How is this content related?" />
              </SelectTrigger>
              <SelectContent>
                {getRelationOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={addLink} 
            className="w-full"
            disabled={!selectedTargetId || !selectedRelation}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Funnel Link
          </Button>
        </CardContent>
      </Card>

      {/* Current Links List */}
      {links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Current Links ({links.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {link.targetType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getLinkStage(link)}
                      </Badge>
                      <span className="text-sm font-medium">{getLinkTitle(link)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Relation: {link.relation}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLink(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
