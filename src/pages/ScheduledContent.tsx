import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Globe, CheckCircle, Loader2, Trash2 } from 'lucide-react';

interface ScheduledCluster {
  id: string;
  title: string;
  description: string;
  topic: string;
  language: string;
  publish_status: string;
  scheduled_publish_at: string | null;
  created_at: string;
  is_active: boolean;
  qa_articles: Array<{ count: number }>;
}

const ScheduledContent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: 'Content Manager', href: '/content-manager' },
    { label: 'Scheduled Content', current: true }
  ];

  // Fetch scheduled and draft clusters
  const { data: scheduledClusters = [], isLoading } = useQuery({
    queryKey: ['scheduled-clusters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_clusters')
        .select('*, qa_articles(count)')
        .in('publish_status', ['draft', 'scheduled'])
        .order('scheduled_publish_at', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return data as ScheduledCluster[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Publish now mutation
  const publishNowMutation = useMutation({
    mutationFn: async (clusterId: string) => {
      const now = new Date().toISOString();
      
      // Update cluster
      const { error: clusterError } = await supabase
        .from('qa_clusters')
        .update({
          publish_status: 'published',
          is_active: true,
          auto_published_at: now
        })
        .eq('id', clusterId);

      if (clusterError) throw clusterError;

      // Update articles
      const { error: articlesError } = await supabase
        .from('qa_articles')
        .update({
          publish_status: 'published',
          published: true,
          auto_published_at: now
        })
        .eq('cluster_id', clusterId)
        .in('publish_status', ['draft', 'scheduled']);

      if (articlesError) throw articlesError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-clusters'] });
      queryClient.invalidateQueries({ queryKey: ['qa-clusters'] });
      queryClient.invalidateQueries({ queryKey: ['qa-articles'] });
      toast({
        title: '✅ Published Successfully',
        description: 'Cluster is now live on the public QA page',
      });
      setPublishingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Publication Failed',
        description: error.message,
        variant: 'destructive',
      });
      setPublishingId(null);
    },
  });

  // Delete cluster mutation
  const deleteClusterMutation = useMutation({
    mutationFn: async (clusterId: string) => {
      // Delete articles first
      const { error: articlesError } = await supabase
        .from('qa_articles')
        .delete()
        .eq('cluster_id', clusterId);

      if (articlesError) throw articlesError;

      // Delete cluster
      const { error: clusterError } = await supabase
        .from('qa_clusters')
        .delete()
        .eq('id', clusterId);

      if (clusterError) throw clusterError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-clusters'] });
      toast({
        title: '🗑️ Deleted Successfully',
        description: 'Cluster and its articles have been removed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Deletion Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handlePublishNow = (clusterId: string) => {
    setPublishingId(clusterId);
    publishNowMutation.mutate(clusterId);
  };

  const handleDelete = (clusterId: string) => {
    if (confirm('Are you sure you want to delete this cluster and all its articles?')) {
      deleteClusterMutation.mutate(clusterId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'published':
        return <Badge className="bg-green-500/10 text-green-700 border-green-200">Published</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeUntilPublish = (scheduledAt: string | null) => {
    if (!scheduledAt) return null;
    
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diffMs = scheduled.getTime() - now.getTime();
    
    if (diffMs < 0) {
      return <span className="text-red-600 font-medium">Overdue</span>;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return <span className="text-muted-foreground">in {diffDays} day{diffDays > 1 ? 's' : ''}</span>;
    } else if (diffHours > 0) {
      return <span className="text-amber-600 font-medium">in {diffHours} hour{diffHours > 1 ? 's' : ''}</span>;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return <span className="text-red-600 font-medium">in {diffMins} min</span>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Scheduled Content - Content Manager</title>
        <meta name="description" content="Manage scheduled publications for QA clusters" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen pt-20">
        <section className="py-4 bg-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </section>
        
        <section className="luxury-gradient py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                Scheduled Publications
              </h1>
              <p className="text-lg text-white/90">
                Manage and monitor scheduled QA cluster publications
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduled & Draft Clusters
                </CardTitle>
                <CardDescription>
                  Clusters awaiting publication or in draft status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : scheduledClusters.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No scheduled content found</p>
                    <p className="text-sm mt-2">Create clusters with scheduled publishing in the Cluster Mode</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cluster Title</TableHead>
                          <TableHead>Topic</TableHead>
                          <TableHead>
                            <Globe className="w-4 h-4 inline mr-1" />
                            Language
                          </TableHead>
                          <TableHead>Articles</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>
                            <Clock className="w-4 h-4 inline mr-1" />
                            Scheduled For
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduledClusters.map((cluster) => (
                          <TableRow key={cluster.id}>
                            <TableCell className="font-medium max-w-xs">
                              <div className="truncate" title={cluster.title}>
                                {cluster.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{cluster.topic}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="uppercase font-medium">{cluster.language}</span>
                            </TableCell>
                            <TableCell>
                              {cluster.qa_articles?.[0]?.count || 0}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(cluster.publish_status)}
                            </TableCell>
                            <TableCell>
                              {cluster.scheduled_publish_at ? (
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {format(new Date(cluster.scheduled_publish_at), 'PPp')}
                                  </div>
                                  <div className="text-xs">
                                    {getTimeUntilPublish(cluster.scheduled_publish_at)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not scheduled</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handlePublishNow(cluster.id)}
                                  disabled={publishingId === cluster.id}
                                >
                                  {publishingId === cluster.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Publishing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Publish Now
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(cluster.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Auto-Publish Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Automatic Publishing</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Scheduled clusters are automatically published every 5 minutes via a cron job. 
                      Clusters with a scheduled time in the past will be published on the next cron run.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Manual Override</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Use the "Publish Now" button to immediately publish any scheduled cluster 
                      without waiting for the scheduled time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
};

export default ScheduledContent;
