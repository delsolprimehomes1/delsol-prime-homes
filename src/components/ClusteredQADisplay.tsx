// Clustered QA Display Component with 3→2→1 Flow
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, MessageCircle, Users, Target, Calendar } from 'lucide-react';
import { QACluster, ClusteredQAArticle } from '@/utils/cluster-manager';
import { useIntegrationManager } from '@/utils/n8n-ghl-integration';
import { useToast } from '@/components/ui/use-toast';

interface ClusteredQADisplayProps {
  clusters: QACluster[];
  language?: string;
  onArticleClick?: (article: ClusteredQAArticle) => void;
  onBookingRequest?: (article: ClusteredQAArticle) => void;
}

const ClusteredQADisplay: React.FC<ClusteredQADisplayProps> = ({
  clusters,
  language = 'en',
  onArticleClick,
  onBookingRequest
}) => {
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const { triggerAppointmentBooking } = useIntegrationManager();
  const { toast } = useToast();

  const toggleCluster = useCallback((clusterId: string) => {
    setExpandedClusters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clusterId)) {
        newSet.delete(clusterId);
      } else {
        newSet.add(clusterId);
      }
      return newSet;
    });
  }, []);

  const handleBookingClick = useCallback(async (article: ClusteredQAArticle) => {
    if (onBookingRequest) {
      onBookingRequest(article);
      return;
    }

    // Trigger default booking flow
    const bookingData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      source: 'QA Cluster BOFU',
      funnelStage: 'BOFU' as const,
      clusterTitle: article.cluster_title || 'Unknown Cluster',
      questionTitle: article.title,
      message: `Interested in consultation after reading: ${article.title}`
    };

    try {
      const result = await triggerAppointmentBooking(bookingData);
      if (result.success) {
        toast({
          title: "Booking Request Sent",
          description: result.message,
        });
      } else {
        toast({
          title: "Booking Request Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process booking request",
        variant: "destructive",
      });
    }
  }, [onBookingRequest, triggerAppointmentBooking, toast]);

  const getFunnelStageIcon = (stage: string) => {
    switch (stage) {
      case 'TOFU': return <Users className="h-4 w-4" />;
      case 'MOFU': return <MessageCircle className="h-4 w-4" />;
      case 'BOFU': return <Target className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getFunnelStageColor = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'MOFU': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'BOFU': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!clusters || clusters.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Clusters Available</h3>
        <p className="text-muted-foreground">
          QA clusters are being organized. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {clusters.map((cluster) => {
        const isExpanded = expandedClusters.has(cluster.id);
        const articles = cluster.articles || [];
        
        // Group articles by funnel stage
        const tofuArticles = articles.filter(a => a.funnel_stage === 'TOFU');
        const mofuArticles = articles.filter(a => a.funnel_stage === 'MOFU');
        const bofuArticles = articles.filter(a => a.funnel_stage === 'BOFU');

        return (
          <Card 
            key={cluster.id} 
            className="cluster-card transition-all duration-200 hover:shadow-lg"
            data-cluster-id={cluster.id}
          >
            <CardHeader className="cursor-pointer" onClick={() => toggleCluster(cluster.id)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="cluster-title flex items-center gap-3">
                    <h1 className="text-xl font-bold text-foreground">{cluster.title}</h1>
                    <Badge variant="outline" className="text-xs">
                      {articles.length} Questions
                    </Badge>
                  </CardTitle>
                  {cluster.description && (
                    <p className="cluster-description text-sm text-muted-foreground mt-2">
                      {cluster.description}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                </Button>
              </div>

              {/* Flow indicator */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{tofuArticles.length} TOFU</span>
                  <ChevronRight className="h-3 w-3" />
                  <span>{mofuArticles.length} MOFU</span>
                  <ChevronRight className="h-3 w-3" />
                  <span>{bofuArticles.length} BOFU</span>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* TOFU Section */}
                  {tofuArticles.length > 0 && (
                    <div className="funnel-stage-section">
                      <h2 className="funnel-stage-header funnel-stage-title text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        {getFunnelStageIcon('TOFU')}
                        TOFU - Awareness Stage
                        <Badge className={getFunnelStageColor('TOFU')}>
                          {tofuArticles.length} variations
                        </Badge>
                      </h2>
                      <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-3">
                        {tofuArticles.map((article, index) => (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            position={index + 1}
                            onArticleClick={onArticleClick}
                            onBookingClick={handleBookingClick}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MOFU Section */}
                  {mofuArticles.length > 0 && (
                    <div className="funnel-stage-section">
                      <h2 className="funnel-stage-header funnel-stage-title text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        {getFunnelStageIcon('MOFU')}
                        MOFU - Consideration Stage
                        <Badge className={getFunnelStageColor('MOFU')}>
                          {mofuArticles.length} questions
                        </Badge>
                      </h2>
                      <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
                        {mofuArticles.map((article, index) => (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            position={index + 4}
                            onArticleClick={onArticleClick}
                            onBookingClick={handleBookingClick}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOFU Section */}
                  {bofuArticles.length > 0 && (
                    <div className="funnel-stage-section">
                      <h2 className="funnel-stage-header funnel-stage-title text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        {getFunnelStageIcon('BOFU')}
                        BOFU - Decision Stage
                        <Badge className={getFunnelStageColor('BOFU')}>
                          Ready to Book
                        </Badge>
                      </h2>
                      <div className="grid gap-3">
                        {bofuArticles.map((article, index) => (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            position={6}
                            onArticleClick={onArticleClick}
                            onBookingClick={handleBookingClick}
                            showBookingCTA={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// Individual Article Card Component
interface ArticleCardProps {
  article: ClusteredQAArticle;
  position: number;
  onArticleClick?: (article: ClusteredQAArticle) => void;
  onBookingClick?: (article: ClusteredQAArticle) => void;
  showBookingCTA?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  position,
  onArticleClick,
  onBookingClick,
  showBookingCTA = false
}) => {
  return (
    <Card className="qa-article-card hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            Position {position}
          </Badge>
          <Badge className={`text-xs ${
            article.funnel_stage === 'TOFU' ? 'bg-blue-100 text-blue-800' :
            article.funnel_stage === 'MOFU' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {article.funnel_stage}
          </Badge>
        </div>

        <h3 className="qa-question qa-question-title font-medium text-foreground mb-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => onArticleClick?.(article)}>
          {article.h3_title || article.title}
        </h3>

        <p className="qa-answer-summary qa-answer-excerpt text-sm text-muted-foreground mb-3 line-clamp-2">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onArticleClick?.(article)}
            className="text-xs"
          >
            Read More
          </Button>

          {showBookingCTA && article.appointment_booking_enabled && (
            <Button
              size="sm"
              onClick={() => onBookingClick?.(article)}
              className="text-xs bg-primary hover:bg-primary/90 next-step-cta"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Book Consultation
            </Button>
          )}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClusteredQADisplay;