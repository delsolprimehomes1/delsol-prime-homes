import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ExternalLink, CheckCircle2, XCircle, Filter, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExternalLink {
  id: string;
  article_id: string;
  article_type: string;
  url: string;
  anchor_text: string;
  context_snippet: string;
  authority_score: number;
  relevance_score: number;
  ai_confidence: number;
  verified: boolean;
  rejected: boolean;
  created_at: string;
}

export default function LinkReviewDashboard() {
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [minAuthorityScore, setMinAuthorityScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, [filterStatus, minAuthorityScore]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('external_links')
        .select('*')
        .gte('authority_score', minAuthorityScore)
        .order('created_at', { ascending: false });

      if (filterStatus === 'pending') {
        query = query.eq('verified', false).eq('rejected', false);
      } else if (filterStatus === 'approved') {
        query = query.eq('verified', true);
      } else if (filterStatus === 'rejected') {
        query = query.eq('rejected', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLink = (linkId: string) => {
    const newSelected = new Set(selectedLinks);
    if (newSelected.has(linkId)) {
      newSelected.delete(linkId);
    } else {
      newSelected.add(linkId);
    }
    setSelectedLinks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLinks.size === links.length) {
      setSelectedLinks(new Set());
    } else {
      setSelectedLinks(new Set(links.map(l => l.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedLinks.size === 0) {
      toast.error('Please select links to approve');
      return;
    }

    try {
      const { error } = await supabase
        .from('external_links')
        .update({ 
          verified: true, 
          rejected: false,
          approved_at: new Date().toISOString()
        })
        .in('id', Array.from(selectedLinks));

      if (error) throw error;

      toast.success(`Approved ${selectedLinks.size} links`);
      setSelectedLinks(new Set());
      fetchLinks();
    } catch (error) {
      console.error('Error approving links:', error);
      toast.error('Failed to approve links');
    }
  };

  const handleBulkReject = async () => {
    if (selectedLinks.size === 0) {
      toast.error('Please select links to reject');
      return;
    }

    try {
      const { error } = await supabase
        .from('external_links')
        .update({ 
          rejected: true,
          verified: false,
          rejected_reason: 'Bulk rejected by admin'
        })
        .in('id', Array.from(selectedLinks));

      if (error) throw error;

      toast.success(`Rejected ${selectedLinks.size} links`);
      setSelectedLinks(new Set());
      fetchLinks();
    } catch (error) {
      console.error('Error rejecting links:', error);
      toast.error('Failed to reject links');
    }
  };

  const getAuthorityColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">External Link Review Dashboard</h1>
        <p className="text-muted-foreground">Review and approve AI-generated external links</p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Status:</label>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Min Authority:</label>
              <Select value={minAuthorityScore.toString()} onValueChange={(v) => setMinAuthorityScore(Number(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All</SelectItem>
                  <SelectItem value="70">70+</SelectItem>
                  <SelectItem value="80">80+</SelectItem>
                  <SelectItem value="90">90+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            {selectedLinks.size > 0 && (
              <div className="flex gap-2">
                <Button onClick={handleBulkApprove} variant="default">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve ({selectedLinks.size})
                </Button>
                <Button onClick={handleBulkReject} variant="destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject ({selectedLinks.size})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{links.filter(l => !l.verified && !l.rejected).length}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{links.filter(l => l.verified).length}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{links.filter(l => l.rejected).length}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{links.length}</div>
            <div className="text-sm text-muted-foreground">Total Links</div>
          </CardContent>
        </Card>
      </div>

      {/* Select All */}
      {links.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            checked={selectedLinks.size === links.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">Select All ({links.length})</span>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading links...
            </CardContent>
          </Card>
        ) : links.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No links found matching your filters
            </CardContent>
          </Card>
        ) : (
          links.map((link) => (
            <Card key={link.id} className={selectedLinks.has(link.id) ? 'border-primary' : ''}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Checkbox
                    checked={selectedLinks.has(link.id)}
                    onCheckedChange={() => handleSelectLink(link.id)}
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg font-semibold hover:underline flex items-center gap-2"
                        >
                          {link.anchor_text}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <p className="text-sm text-muted-foreground mt-1">{link.url}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {link.verified && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {link.rejected && (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm italic">"{link.context_snippet}"</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Authority:</span>
                        <Badge className={getAuthorityColor(link.authority_score)}>
                          {link.authority_score}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Relevance:</span>
                        <Badge className={getRelevanceColor(link.relevance_score)}>
                          {link.relevance_score}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Confidence:</span>
                        <Badge variant="outline">
                          {(link.ai_confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Type:</span>
                        <Badge variant="secondary">{link.article_type}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
