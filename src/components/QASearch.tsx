import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QASearchProps {
  articles: Array<{
    topic: string;
    funnel_stage: string;
    tags?: string[];
  }>;
}

const QASearch: React.FC<QASearchProps> = ({ articles }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || 'all');
  const [selectedStage, setSelectedStage] = useState(searchParams.get('stage') || 'all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get unique topics and stages from articles
  const topics = [...new Set(articles.map(a => a.topic))].filter(Boolean);
  const stages = [...new Set(articles.map(a => a.funnel_stage))].filter(Boolean);

  const funnelStageConfig = {
    TOFU: { icon: Lightbulb, label: 'Discover', color: 'text-blue-600' },
    MOFU: { icon: Target, label: 'Consider', color: 'text-amber-600' },
    BOFU: { icon: TrendingUp, label: 'Decide', color: 'text-green-600' },
  };

  const topicLabels = {
    connectivity: 'Connectivity & Transport',
    lifestyle: 'Lifestyle & Living',
    investment: 'Investment Opportunities',
    mixed: 'General Guidance',
  };

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (selectedTopic !== 'all') params.set('topic', selectedTopic);
    if (selectedStage !== 'all') params.set('stage', selectedStage);
    
    setSearchParams(params);
  }, [searchQuery, selectedTopic, selectedStage, setSearchParams]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTopic('all');
    setSelectedStage('all');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedTopic !== 'all' || selectedStage !== 'all';

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search property guides..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4 h-12 bg-white/80 backdrop-blur-sm border-muted shadow-sm focus:shadow-md transition-all duration-200"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={cn(
            "transition-all duration-200",
            isFilterOpen && "bg-primary/10 border-primary/30"
          )}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>

        {/* Quick Filter Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {stages.map((stage) => {
            const config = funnelStageConfig[stage as keyof typeof funnelStageConfig];
            const Icon = config?.icon || Target;
            
            return (
              <Button
                key={stage}
                variant={selectedStage === stage ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStage(selectedStage === stage ? 'all' : stage)}
                className="transition-all duration-200"
              >
                <Icon className={cn("w-3 h-3 mr-1", config?.color)} />
                {config?.label || stage}
              </Button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isFilterOpen && (
        <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg border animate-fade-in-up space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Topic</label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="bg-white/80">
                  <SelectValue placeholder="All topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topicLabels[topic as keyof typeof topicLabels] || topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Journey Stage</label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="bg-white/80">
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {stages.map((stage) => {
                    const config = funnelStageConfig[stage as keyof typeof funnelStageConfig];
                    const Icon = config?.icon || Target;
                    
                    return (
                      <SelectItem key={stage} value={stage}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-4 h-4", config?.color)} />
                          {config?.label || stage}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {selectedTopic !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {topicLabels[selectedTopic as keyof typeof topicLabels] || selectedTopic}
              <button onClick={() => setSelectedTopic('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {selectedStage !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {funnelStageConfig[selectedStage as keyof typeof funnelStageConfig]?.label || selectedStage}
              <button onClick={() => setSelectedStage('all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default QASearch;