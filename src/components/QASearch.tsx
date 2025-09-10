import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

interface QASearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStage: string;
  onStageChange: (stage: string) => void;
  hideStageFilter?: boolean;
}

export const QASearch = ({ searchTerm, onSearchChange, selectedStage, onStageChange, hideStageFilter = false }: QASearchProps) => {
  const stages = [
    { value: '', label: 'All Questions', color: 'bg-muted text-foreground' },
    { value: 'TOFU', label: 'Getting Started', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
    { value: 'MOFU', label: 'Researching', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    { value: 'BOFU', label: 'Ready to Buy', color: 'bg-green-500/10 text-green-700 border-green-200' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in animation-delay-300">
      {/* Search Input */}
      <div className="relative max-w-md mx-auto px-4 sm:px-0">
        <Search className="absolute left-6 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search questions..."
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

      {/* Stage Filters */}
      {!hideStageFilter && (
        <div className="flex flex-col sm:flex-row sm:justify-center gap-2 px-4 sm:px-0">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2">
            {stages.map((stage) => (
              <Badge
                key={stage.value}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 px-3 py-2 sm:px-4 text-center touch-target-44 ${
                  selectedStage === stage.value
                    ? stage.color
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
                onClick={() => onStageChange(stage.value)}
              >
                {stage.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};