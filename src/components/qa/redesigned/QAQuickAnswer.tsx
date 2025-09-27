import React from 'react';
import { Card } from '@/components/ui/card';
import { Zap, TrendingUp, MapPin, DollarSign } from 'lucide-react';

interface QuickAnswerStat {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface QAQuickAnswerProps {
  directAnswer: string;
  stats?: QuickAnswerStat[];
  className?: string;
}

export const QAQuickAnswer: React.FC<QAQuickAnswerProps> = ({
  directAnswer,
  stats,
  className = "",
}) => {
  // Default stats if none provided
  const defaultStats: QuickAnswerStat[] = [
    { label: "Avg Property Price", value: "€450k", icon: DollarSign },
    { label: "Market Growth", value: "+8.2%", icon: TrendingUp },
    { label: "Top Location", value: "Marbella", icon: MapPin },
    { label: "Process Time", value: "3-6 months", icon: Zap },
  ];

  const displayStats = stats || defaultStats;

  return (
    <section className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Quick Answer
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Direct Answer */}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-800 leading-relaxed text-lg">
            {directAnswer}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {displayStats.slice(0, 4).map((stat, index) => {
            const IconComponent = stat.icon || Zap;
            return (
              <Card key={index} className="text-center p-4 bg-gray-50 border-0 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center space-y-2">
                  <IconComponent className="w-5 h-5 text-indigo-600" />
                  <div className="text-2xl font-bold text-indigo-600">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QAQuickAnswer;