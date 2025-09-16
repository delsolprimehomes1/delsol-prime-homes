import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, FolderOpen } from 'lucide-react';

interface QASearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStage: string;
  onStageChange: (stage: string) => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  hideStageFilter?: boolean;
}

export const QASearch = ({ 
  searchTerm, 
  onSearchChange, 
  selectedStage, 
  onStageChange,
  selectedTopic,
  onTopicChange,
  hideStageFilter = false 
}: QASearchProps) => {
  const stages = [
    { value: '', label: 'All Questions', color: 'bg-muted text-foreground' },
    { value: 'TOFU', label: 'Getting Started', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
    { value: 'MOFU', label: 'Researching', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    { value: 'BOFU', label: 'Ready to Buy', color: 'bg-green-500/10 text-green-700 border-green-200' }
  ];

  const topicClusters = [
    { value: '', label: 'All Topics', color: 'bg-muted text-foreground' },
    { value: 'Getting Started', label: 'Getting Started', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
    { value: 'Legal & Documentation', label: 'Legal & Docs', color: 'bg-red-500/10 text-red-700 border-red-200' },
    { value: 'Financing & Mortgages', label: 'Financing', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200' },
    { value: 'Property Search', label: 'Property Search', color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
    { value: 'Investment Strategy', label: 'Investment', color: 'bg-teal-500/10 text-teal-700 border-teal-200' },
    { value: 'International Buyer Journey', label: 'International', color: 'bg-cyan-500/10 text-cyan-700 border-cyan-200' },
    { value: 'Property Maintenance & Management', label: 'Maintenance', color: 'bg-lime-500/10 text-lime-700 border-lime-200' },
    { value: 'Lifestyle Integration', label: 'Lifestyle', color: 'bg-pink-500/10 text-pink-700 border-pink-200' },
    { value: 'Rental Investment', label: 'Rental', color: 'bg-violet-500/10 text-violet-700 border-violet-200' },
    { value: 'Renovation & Development', label: 'Renovation', color: 'bg-rose-500/10 text-rose-700 border-rose-200' },
    { value: 'Insurance & Protection', label: 'Insurance', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    { value: 'Utilities & Services', label: 'Utilities', color: 'bg-sky-500/10 text-sky-700 border-sky-200' },
    { value: 'Transportation & Accessibility', label: 'Transport', color: 'bg-stone-500/10 text-stone-700 border-stone-200' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in animation-delay-300">
      {/* Search Input */}
      <div className="relative max-w-md mx-auto px-4 sm:px-0">
        <Search className="absolute left-6 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search questions, topics, or keywords..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 sm:pl-10 pr-12 sm:pr-10 h-12 sm:h-10 bg-white/90 backdrop-blur-sm border-white/30 focus:border-primary/50 text-foreground placeholder:text-muted-foreground text-base sm:text-sm"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="absolute right-6 sm:right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-foreground touch-target-44"
          >
            <X className="w-4 h-4 sm:w-3 sm:h-3" />
          </Button>
        )}
      </div>

      {/* Topic Cluster Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-white/70">
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Filter by Topic</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 px-4 sm:px-0 max-w-5xl mx-auto">
          {topicClusters.map((topic) => (
            <Badge
              key={topic.value}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 px-3 py-2 text-center touch-target-44 text-xs ${
                selectedTopic === topic.value
                  ? 'bg-white text-primary shadow-lg'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
              }`}
              onClick={() => onTopicChange(topic.value)}
            >
              {topic.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stage Filters */}
      {!hideStageFilter && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-white/70">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by Stage</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-2 px-4 sm:px-0">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2">
              {stages.map((stage) => (
                <Badge
                  key={stage.value}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 px-3 py-2 sm:px-4 text-center touch-target-44 ${
                    selectedStage === stage.value
                      ? 'bg-white text-primary shadow-lg'
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  }`}
                  onClick={() => onStageChange(stage.value)}
                >
                  {stage.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};