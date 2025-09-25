import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowRight, Link, Search, Filter, Eye, Zap, AlertTriangle, CheckCircle, X, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FunnelJourneyPreview } from './FunnelJourneyPreview';

interface EnhancedArticle {
  id: string;
  title: string;
  slug: string;
  topic: string;
  funnel_stage: string;
  points_to_mofu_id?: string;
  points_to_bofu_id?: string;
  appointment_booking_enabled?: boolean;
  final_cta_type?: 'booking' | 'consultation' | 'download' | 'newsletter' | 'custom';
  final_cta_url?: string;
  linking_notes?: string;
}

interface SmartSuggestion {
  targetId: string;
  title: string;
  topic: string;
  confidence: number;
  reason: string;
}

interface RejectedSuggestion {
  sourceId: string;
  targetId: string;
  rejectedAt: number;
  rejectedBy: string;
}

export const EnhancedFunnelLinkManager: React.FC = () => {
  const [articles, setArticles] = useState<EnhancedArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<EnhancedArticle[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Map<string, SmartSuggestion[]>>(new Map());
  const [rejectedSuggestions, setRejectedSuggestions] = useState<RejectedSuggestion[]>([]);
  const [previewArticle, setPreviewArticle] = useState<EnhancedArticle | null>(null);
  const [editingCTA, setEditingCTA] = useState<EnhancedArticle | null>(null);
  const [bulkApplying, setBulkApplying] = useState(false);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('qa_articles')
        .select(`
          id, title, slug, topic, funnel_stage, 
          points_to_mofu_id, points_to_bofu_id, 
          appointment_booking_enabled, final_cta_type, 
          final_cta_url, linking_notes
        `)
        .order('funnel_stage')
        .order('topic')
        .order('title');

      if (error) throw error;

      setArticles(data || []);
      setFilteredArticles(data || []);
      
      const uniqueTopics = [...new Set((data || []).map(a => a.topic))];
      setTopics(uniqueTopics);

      // Generate smart suggestions
      await generateSmartSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const generateSmartSuggestions = async (articlesData: EnhancedArticle[]) => {
    const newSuggestions = new Map<string, SmartSuggestion[]>();

    for (const article of articlesData) {
      if (article.funnel_stage === 'TOFU' && !article.points_to_mofu_id) {
        const mofuOptions = articlesData.filter(a => 
          a.funnel_stage === 'MOFU' && 
          (a.topic === article.topic || a.topic === 'general')
        );

        const suggestions: SmartSuggestion[] = mofuOptions.map(mofu => ({
          targetId: mofu.id,
          title: mofu.title,
          topic: mofu.topic,
          confidence: mofu.topic === article.topic ? 95 : 60,
          reason: mofu.topic === article.topic ? 'Perfect topic match' : 'General fallback option'
        })).sort((a, b) => b.confidence - a.confidence);

        if (suggestions.length > 0) {
          newSuggestions.set(article.id, suggestions.slice(0, 3));
        }
      } else if (article.funnel_stage === 'MOFU' && !article.points_to_bofu_id) {
        const bofuOptions = articlesData.filter(a => 
          a.funnel_stage === 'BOFU' && 
          (a.topic === article.topic || a.topic === 'general')
        );

        const suggestions: SmartSuggestion[] = bofuOptions.map(bofu => ({
          targetId: bofu.id,
          title: bofu.title,
          topic: bofu.topic,
          confidence: bofu.topic === article.topic ? 95 : 60,
          reason: bofu.topic === article.topic ? 'Perfect topic match' : 'General fallback option'
        })).sort((a, b) => b.confidence - a.confidence);

        if (suggestions.length > 0) {
          newSuggestions.set(article.id, suggestions.slice(0, 3));
        }
      }
    }

    setSuggestions(newSuggestions);
  };

  const linkArticles = async (sourceId: string, targetId: string, linkType: 'mofu' | 'bofu', notes?: string) => {
    try {
      const updateData = linkType === 'mofu' 
        ? { points_to_mofu_id: targetId, linking_notes: notes }
        : { points_to_bofu_id: targetId, linking_notes: notes };

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

  const updateCTA = async (articleId: string, ctaType: string, ctaUrl?: string, notes?: string) => {
    try {
      const updateData: any = { 
        final_cta_type: ctaType,
        linking_notes: notes 
      };

      if (ctaType === 'custom' && ctaUrl) {
        updateData.final_cta_url = ctaUrl;
      }

      // Update appointment_booking_enabled based on CTA type
      updateData.appointment_booking_enabled = ctaType === 'booking';

      const { error } = await supabase
        .from('qa_articles')
        .update(updateData)
        .eq('id', articleId);

      if (error) throw error;

      toast.success(`CTA updated successfully`);
      fetchArticles();
      setEditingCTA(null);
    } catch (error) {
      console.error('Error updating CTA:', error);
      toast.error('Failed to update CTA');
    }
  };

  const applySuggestion = async (sourceId: string, suggestion: SmartSuggestion, linkType: 'mofu' | 'bofu') => {
    await linkArticles(sourceId, suggestion.targetId, linkType, `Auto-applied: ${suggestion.reason}`);
  };

  const rejectSuggestion = (sourceId: string, targetId: string) => {
    const newRejection: RejectedSuggestion = {
      sourceId,
      targetId,
      rejectedAt: Date.now(),
      rejectedBy: 'admin' // In a real app, this would be the current user ID
    };

    const updatedRejections = [...rejectedSuggestions, newRejection];
    setRejectedSuggestions(updatedRejections);
    
    // Save to localStorage for persistence
    localStorage.setItem('rejectedSuggestions', JSON.stringify(updatedRejections));
    
    toast.success('Suggestion rejected');
  };

  const isRejected = (sourceId: string, targetId: string): boolean => {
    return rejectedSuggestions.some(r => r.sourceId === sourceId && r.targetId === targetId);
  };

  const applyAllHighConfidence = async () => {
    setBulkApplying(true);
    let appliedCount = 0;
    
    try {
      for (const [sourceId, articleSuggestions] of suggestions.entries()) {
        const article = articles.find(a => a.id === sourceId);
        if (!article) continue;

        const highConfidenceSuggestions = articleSuggestions.filter(
          s => s.confidence >= 90 && !isRejected(sourceId, s.targetId)
        );

        if (highConfidenceSuggestions.length > 0) {
          const topSuggestion = highConfidenceSuggestions[0];
          const linkType = article.funnel_stage === 'TOFU' ? 'mofu' : 'bofu';
          
          await linkArticles(
            sourceId, 
            topSuggestion.targetId, 
            linkType, 
            `Bulk auto-applied: ${topSuggestion.reason}`
          );
          appliedCount++;
        }
      }

      toast.success(`Successfully applied ${appliedCount} high-confidence suggestions`);
      fetchArticles(); // Refresh to show updated links
    } catch (error) {
      console.error('Error in bulk apply:', error);
      toast.error('Failed to apply some suggestions');
    } finally {
      setBulkApplying(false);
    }
  };

  const getFilteredSuggestions = (sourceId: string, suggestions: SmartSuggestion[]): SmartSuggestion[] => {
    return suggestions.filter(s => !isRejected(sourceId, s.targetId));
  };

  const getHighConfidenceCount = (): number => {
    let count = 0;
    for (const [sourceId, articleSuggestions] of suggestions.entries()) {
      const filteredSuggestions = getFilteredSuggestions(sourceId, articleSuggestions);
      count += filteredSuggestions.filter(s => s.confidence >= 90).length;
    }
    return count;
  };

  useEffect(() => {
    fetchArticles();
    
    // Load rejected suggestions from localStorage
    const saved = localStorage.getItem('rejectedSuggestions');
    if (saved) {
      try {
        setRejectedSuggestions(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading rejected suggestions:', error);
      }
    }
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
      // Prioritize same-topic MOFU articles
      const sameTopicMofu = articles.filter(a => a.funnel_stage === 'MOFU' && a.topic === topic);
      const otherMofu = articles.filter(a => a.funnel_stage === 'MOFU' && a.topic !== topic);
      return [...sameTopicMofu, ...otherMofu];
    } else if (stage === 'MOFU') {
      // Prioritize same-topic BOFU articles
      const sameTopicBofu = articles.filter(a => a.funnel_stage === 'BOFU' && a.topic === topic);
      const otherBofu = articles.filter(a => a.funnel_stage === 'BOFU' && a.topic !== topic);
      return [...sameTopicBofu, ...otherBofu];
    }
    return [];
  };

  const getLinkedArticle = (article: EnhancedArticle) => {
    if (article.funnel_stage === 'TOFU' && article.points_to_mofu_id) {
      return articles.find(a => a.id === article.points_to_mofu_id);
    } else if (article.funnel_stage === 'MOFU' && article.points_to_bofu_id) {
      return articles.find(a => a.id === article.points_to_bofu_id);
    }
    return null;
  };

  const getTopicAlignmentColor = (article: EnhancedArticle) => {
    const linkedArticle = getLinkedArticle(article);
    if (!linkedArticle) return 'text-orange-600';
    
    return linkedArticle.topic === article.topic 
      ? 'text-green-600' 
      : 'text-red-600';
  };

  if (loading) {
    return <div className="p-6">Loading enhanced funnel manager...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Enhanced Funnel Link Manager
          </CardTitle>
          <CardDescription>
            Manage topic-aligned funnel journeys with smart suggestions and visual previews
          </CardDescription>
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

            <div className="flex gap-2">
              <Badge variant="outline" className="justify-center">
                {filteredArticles.length} Articles
              </Badge>
              {getHighConfidenceCount() > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={applyAllHighConfidence}
                  disabled={bulkApplying}
                  className="flex items-center gap-1"
                >
                  <CheckCheck className="w-4 h-4" />
                  {bulkApplying ? 'Applying...' : `Apply ${getHighConfidenceCount()} High Confidence`}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Management */}
      <div className="space-y-4">
        {filteredArticles.map((article) => {
          const linkedArticle = getLinkedArticle(article);
          const targetArticles = getTargetArticles(article.funnel_stage, article.topic);
          const allSuggestions = suggestions.get(article.id) || [];
          const articleSuggestions = getFilteredSuggestions(article.id, allSuggestions);
          const alignmentColor = getTopicAlignmentColor(article);
          
          return (
            <Card key={article.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={
                        article.funnel_stage === 'TOFU' ? 'default' : 
                        article.funnel_stage === 'MOFU' ? 'secondary' : 'destructive'
                      }>
                        {article.funnel_stage}
                      </Badge>
                      <Badge variant="outline">{article.topic}</Badge>
                      {linkedArticle && linkedArticle.topic !== article.topic && (
                        <Badge variant="destructive" className="text-xs">Topic Misaligned</Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">/{article.slug}</p>
                    
                    {/* Current Link Status */}
                    <div className="flex items-center gap-2 mb-4">
                      {linkedArticle ? (
                        <div className={`flex items-center gap-2 ${alignmentColor}`}>
                          <Link className="w-4 h-4" />
                          <ArrowRight className="w-4 h-4" />
                          <span className="font-medium">{linkedArticle.title}</span>
                          {linkedArticle.topic === article.topic ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      ) : article.funnel_stage === 'BOFU' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant={article.final_cta_type === 'booking' ? 'default' : 'secondary'}>
                            CTA: {article.final_cta_type || 'booking'}
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-orange-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>No {article.funnel_stage === 'TOFU' ? 'MOFU' : 'BOFU'} link</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {article.linking_notes && (
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        <strong>Notes:</strong> {article.linking_notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[250px]">
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setPreviewArticle(article)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Preview Journey
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Funnel Journey Preview</DialogTitle>
                            <DialogDescription>
                              Complete funnel path for: {article.title}
                            </DialogDescription>
                          </DialogHeader>
                          <FunnelJourneyPreview article={article} allArticles={articles} />
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Main Control */}
                    {article.funnel_stage === 'BOFU' ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setEditingCTA(article)}
                          >
                            Manage CTA: {article.final_cta_type || 'booking'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Final CTA</DialogTitle>
                            <DialogDescription>
                              Configure the final call-to-action for this BOFU article
                            </DialogDescription>
                          </DialogHeader>
                          <CTAManager article={article} onUpdate={updateCTA} />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="space-y-2">
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
                                <div className="flex items-center gap-2">
                                  <span>{target.title.substring(0, 40)}...</span>
                                  <Badge variant={target.topic === article.topic ? 'default' : 'outline'} className="text-xs">
                                    {target.topic}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Smart Suggestions */}
                        {articleSuggestions.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-blue-800 mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                Smart Suggestions
                              </div>
                              {articleSuggestions.filter(s => s.confidence >= 90).length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {articleSuggestions.filter(s => s.confidence >= 90).length} High Confidence
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1">
                              {articleSuggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <div className="flex-1">
                                    <div className="font-medium">{suggestion.title.substring(0, 30)}...</div>
                                    <div className="text-blue-600 flex items-center gap-1">
                                      {suggestion.reason} ({suggestion.confidence}%)
                                      {suggestion.confidence >= 90 && (
                                        <Badge variant="default" className="text-xs px-1 py-0">
                                          High
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => applySuggestion(
                                        article.id, 
                                        suggestion, 
                                        article.funnel_stage === 'TOFU' ? 'mofu' : 'bofu'
                                      )}
                                    >
                                      Apply
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                      onClick={() => rejectSuggestion(article.id, suggestion.targetId)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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

// CTA Manager Component
const CTAManager: React.FC<{
  article: EnhancedArticle;
  onUpdate: (id: string, type: string, url?: string, notes?: string) => void;
}> = ({ article, onUpdate }) => {
  const [ctaType, setCtaType] = useState(article.final_cta_type || 'booking');
  const [ctaUrl, setCtaUrl] = useState(article.final_cta_url || '');
  const [notes, setNotes] = useState(article.linking_notes || '');

  const ctaOptions = [
    { value: 'booking', label: 'Booking Bot Page', description: 'Direct to appointment booking' },
    { value: 'consultation', label: 'Consultation Flow', description: 'Schedule consultation call' },
    { value: 'download', label: 'Download Guide', description: 'PDF or resource download' },
    { value: 'newsletter', label: 'Newsletter Signup', description: 'Email subscription' },
    { value: 'custom', label: 'Custom URL', description: 'Custom destination' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cta-type">CTA Type</Label>
        <Select value={ctaType} onValueChange={(value) => setCtaType(value as 'booking' | 'consultation' | 'download' | 'newsletter' | 'custom')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ctaOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {ctaType === 'custom' && (
        <div>
          <Label htmlFor="cta-url">Custom URL</Label>
          <Input
            id="cta-url"
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder="https://example.com/custom-page"
          />
        </div>
      )}

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about this CTA choice..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button onClick={() => onUpdate(article.id, ctaType, ctaUrl, notes)}>
          Update CTA
        </Button>
      </DialogFooter>
    </div>
  );
};