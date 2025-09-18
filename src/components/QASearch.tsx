import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, FolderOpen } from 'lucide-react';

interface QASearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

export const QASearch = ({ 
  searchTerm, 
  onSearchChange, 
  selectedTopic,
  onTopicChange
}: QASearchProps) => {
  const topicClusters = [
    { value: '', label: 'All Topics (154)', color: 'bg-muted text-foreground' },
    { value: 'Lifestyle', label: 'Lifestyle (46)', color: 'bg-pink-500/10 text-pink-700 border-pink-200' },
    { value: 'Investment', label: 'Investment (19)', color: 'bg-teal-500/10 text-teal-700 border-teal-200' },
    { value: 'General', label: 'General (15)', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
    { value: 'Location', label: 'Location (14)', color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
    { value: 'Property Types', label: 'Property Types (12)', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
    { value: 'Market Intelligence & Timing', label: 'Market Timing (6)', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    { value: 'Investment & Financing', label: 'Financing (6)', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200' },
    { value: 'Legal & Process Timeline', label: 'Legal & Process (6)', color: 'bg-red-500/10 text-red-700 border-red-200' },
    { value: 'Property Types & Features', label: 'Property Features (6)', color: 'bg-cyan-500/10 text-cyan-700 border-cyan-200' },
    { value: 'Location Intelligence', label: 'Property Search (6)', color: 'bg-lime-500/10 text-lime-700 border-lime-200' },
    { value: 'Finance', label: 'Finance (5)', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
    { value: 'Service', label: 'Services (4)', color: 'bg-sky-500/10 text-sky-700 border-sky-200' },
    { value: 'Infrastructure', label: 'Infrastructure (3)', color: 'bg-violet-500/10 text-violet-700 border-violet-200' }
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

    </div>
  );
};