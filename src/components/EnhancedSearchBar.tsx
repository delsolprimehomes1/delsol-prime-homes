import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'question' | 'category' | 'tag';
  count?: number;
}

interface EnhancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  className?: string;
}

export function EnhancedSearchBar({ 
  value, 
  onChange, 
  suggestions = [], 
  placeholder = "Search questions, answers, or topics...",
  className 
}: EnhancedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(s => 
    s.text.toLowerCase().includes(value.toLowerCase()) && value.length > 0
  ).slice(0, 6);

  useEffect(() => {
    setShowSuggestions(isFocused && filteredSuggestions.length > 0 && value.length > 0);
    setSelectedIndex(-1);
  }, [isFocused, filteredSuggestions.length, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onChange(filteredSuggestions[selectedIndex].text);
          setShowSuggestions(false);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'question': return '❓';
      case 'category': return '📂';
      case 'tag': return '🏷️';
      default: return '🔍';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "relative transition-all duration-300 ease-in-out",
        isFocused && "transform scale-[1.02] shadow-lg"
      )}>
        <Search className={cn(
          "absolute left-3 top-3 h-5 w-5 transition-colors duration-200",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
        
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow suggestion clicks
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-10 pr-10 h-12 text-base transition-all duration-300",
            "focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "bg-background/50 backdrop-blur-sm",
            isFocused && "bg-background shadow-lg"
          )}
        />
        
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-2",
            "bg-background/95 backdrop-blur-lg border rounded-lg shadow-xl",
            "animate-in slide-in-from-top-2 duration-200"
          )}
        >
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground mb-2">
              <TrendingUp className="h-3 w-3" />
              Suggestions
            </div>
            
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-150",
                  "hover:bg-muted/50 hover:scale-[1.02]",
                  selectedIndex === index && "bg-primary/10 ring-1 ring-primary/20"
                )}
              >
                <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{suggestion.text}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                    {suggestion.count && (
                      <span className="text-xs text-muted-foreground">
                        {suggestion.count} results
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}