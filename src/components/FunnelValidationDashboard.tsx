import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, AlertTriangle, CheckCircle, Zap, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FunnelStats {
  tofu: { total: number; linked: number; missing: number };
  mofu: { total: number; linked: number; missing: number };
  bofu: { total: number; linked: number; missing: number };
}

interface MissingLink {
  id: string;
  title: string;
  slug: string;
  topic: string;
  funnelStage: string;
}

export const FunnelValidationDashboard: React.FC = () => {
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [missingLinks, setMissingLinks] = useState<MissingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoFixing, setAutoFixing] = useState(false);

  const fetchFunnelData = async () => {
    try {
      const { data: articles, error } = await supabase
        .from('qa_articles')
        .select('id, title, slug, topic, funnel_stage, points_to_mofu_id, points_to_bofu_id, appointment_booking_enabled');

      if (error) throw error;

      const tofu = articles?.filter(a => a.funnel_stage === 'TOFU') || [];
      const mofu = articles?.filter(a => a.funnel_stage === 'MOFU') || [];
      const bofu = articles?.filter(a => a.funnel_stage === 'BOFU') || [];

      const tofuLinked = tofu.filter(a => a.points_to_mofu_id).length;
      const mofuLinked = mofu.filter(a => a.points_to_bofu_id).length;
      const bofuLinked = bofu.filter(a => a.appointment_booking_enabled).length;

      setStats({
        tofu: { total: tofu.length, linked: tofuLinked, missing: tofu.length - tofuLinked },
        mofu: { total: mofu.length, linked: mofuLinked, missing: mofu.length - mofuLinked },
        bofu: { total: bofu.length, linked: bofuLinked, missing: bofu.length - bofuLinked }
      });

      // Get missing links
      const missing: MissingLink[] = [
        ...tofu.filter(a => !a.points_to_mofu_id).map(a => ({ ...a, funnelStage: 'TOFU' })),
        ...mofu.filter(a => !a.points_to_bofu_id).map(a => ({ ...a, funnelStage: 'MOFU' })),
        ...bofu.filter(a => !a.appointment_booking_enabled).map(a => ({ ...a, funnelStage: 'BOFU' }))
      ];

      setMissingLinks(missing);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      toast.error('Failed to load funnel data');
    } finally {
      setLoading(false);
    }
  };

  const autoFixFunnel = async () => {
    setAutoFixing(true);
    try {
      // Auto-link TOFU to MOFU by topic
      const { data: articles } = await supabase
        .from('qa_articles')
        .select('id, slug, topic, funnel_stage, points_to_mofu_id, points_to_bofu_id');

      if (!articles) return;

      const tofu = articles.filter(a => a.funnel_stage === 'TOFU' && !a.points_to_mofu_id);
      const mofu = articles.filter(a => a.funnel_stage === 'MOFU');
      const bofuArticles = articles.filter(a => a.funnel_stage === 'BOFU');

      // Link TOFU to MOFU
      for (const tofuArticle of tofu) {
        const matchingMofu = mofu.find(m => m.topic === tofuArticle.topic) || mofu[0];
        if (matchingMofu) {
          await supabase
            .from('qa_articles')
            .update({ points_to_mofu_id: matchingMofu.id })
            .eq('id', tofuArticle.id);
        }
      }

      // Link MOFU to BOFU
      const unlinkedMofu = articles.filter(a => a.funnel_stage === 'MOFU' && !a.points_to_bofu_id);
      for (const mofuArticle of unlinkedMofu) {
        const matchingBofu = bofuArticles.find(b => b.topic === mofuArticle.topic) || bofuArticles[0];
        if (matchingBofu) {
          await supabase
            .from('qa_articles')
            .update({ points_to_bofu_id: matchingBofu.id })
            .eq('id', mofuArticle.id);
        }
      }

      // Enable booking for all BOFU
      await supabase
        .from('qa_articles')
        .update({ appointment_booking_enabled: true })
        .eq('funnel_stage', 'BOFU');

      toast.success('Funnel auto-fix completed successfully!');
      fetchFunnelData();
    } catch (error) {
      console.error('Error auto-fixing funnel:', error);
      toast.error('Failed to auto-fix funnel');
    } finally {
      setAutoFixing(false);
    }
  };

  const exportFunnelMapping = async () => {
    try {
      const { data: articles } = await supabase
        .from('qa_articles')
        .select('title, slug, topic, funnel_stage, points_to_mofu_id, points_to_bofu_id, appointment_booking_enabled');

      const csv = [
        'Title,Slug,Topic,Stage,MOFU Link,BOFU Link,Booking Enabled',
        ...(articles || []).map(a => 
          `"${a.title}","${a.slug}","${a.topic}","${a.funnel_stage}","${a.points_to_mofu_id || ''}","${a.points_to_bofu_id || ''}","${a.appointment_booking_enabled}"`
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'funnel-mapping.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export funnel mapping');
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading funnel data...</div>;
  }

  const overallHealth = stats ? 
    Math.round(((stats.tofu.linked + stats.mofu.linked + stats.bofu.linked) / 
    (stats.tofu.total + stats.mofu.total + stats.bofu.total)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Funnel Health Overview
            <Badge variant={overallHealth > 80 ? 'default' : 'destructive'}>
              {overallHealth}% Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Monitor and fix funnel progression across all stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallHealth} className="h-3" />
            
            <div className="flex justify-between">
              <Button 
                onClick={autoFixFunnel}
                disabled={autoFixing}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {autoFixing ? 'Auto-Fixing...' : 'Auto-Fix All Funnels'}
              </Button>
              
              <Button variant="outline" onClick={exportFunnelMapping}>
                <Download className="w-4 h-4 mr-2" />
                Export Mapping
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats && [
          { name: 'TOFU → MOFU', data: stats.tofu, nextStage: 'Research Guides' },
          { name: 'MOFU → BOFU', data: stats.mofu, nextStage: 'Decision Guides' },
          { name: 'BOFU → Booking', data: stats.bofu, nextStage: 'Booking Page' }
        ].map((stage, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={stage.data.missing === 0 ? 'default' : 'destructive'}>
                  {stage.data.linked}/{stage.data.total} Linked
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{stage.nextStage}</span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress 
                value={(stage.data.linked / stage.data.total) * 100} 
                className="h-2"
              />
              {stage.data.missing > 0 && (
                <Alert className="mt-3">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    {stage.data.missing} articles need linking
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Missing Links Table */}
      {missingLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Articles Needing Links ({missingLinks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {missingLinks.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{article.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {article.topic} • {article.funnelStage} Stage
                    </div>
                  </div>
                  <Badge variant="outline">
                    {article.funnelStage === 'TOFU' ? 'Needs MOFU Link' : 
                     article.funnelStage === 'MOFU' ? 'Needs BOFU Link' : 
                     'Needs Booking Enable'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};