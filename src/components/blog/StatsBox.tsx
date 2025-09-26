import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: string;
  description?: string;
}

interface StatsBoxProps {
  title: string;
  subtitle?: string;
  stats: StatItem[];
  className?: string;
  variant?: 'default' | 'highlighted';
}

export const StatsBox: React.FC<StatsBoxProps> = ({
  title,
  subtitle,
  stats,
  className = '',
  variant = 'default'
}) => {
  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`
      ${variant === 'highlighted' ? 'border-primary/20 bg-primary/5' : 'bg-background'} 
      ${className}
    `}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg md:text-xl mb-1">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {variant === 'highlighted' && (
            <Badge variant="secondary">Key Stats</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
                {stat.trend && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stat.trend)}
                    {stat.percentage && (
                      <span className={`text-xs ${getTrendColor(stat.trend)}`}>
                        {stat.percentage}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {stat.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};