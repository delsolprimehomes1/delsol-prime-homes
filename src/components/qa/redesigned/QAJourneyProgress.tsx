import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface JourneyStage {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface QAJourneyProgressProps {
  currentStage: 'TOFU' | 'MOFU' | 'BOFU';
  topic?: string;
  totalArticlesInTopic?: number;
  currentPosition?: number;
  className?: string;
}

export const QAJourneyProgress: React.FC<QAJourneyProgressProps> = ({
  currentStage,
  topic,
  totalArticlesInTopic,
  currentPosition,
  className = "",
}) => {
  const stages: JourneyStage[] = [
    {
      id: 'TOFU',
      title: 'Getting Started',
      description: 'Learning the basics',
      completed: currentStage === 'MOFU' || currentStage === 'BOFU',
      current: currentStage === 'TOFU',
    },
    {
      id: 'MOFU', 
      title: 'Researching Options',
      description: 'Exploring possibilities',
      completed: currentStage === 'BOFU',
      current: currentStage === 'MOFU',
    },
    {
      id: 'BOFU',
      title: 'Ready to Buy',
      description: 'Making decisions',
      completed: false,
      current: currentStage === 'BOFU',
    },
  ];

  const getStageNumber = (stageId: string) => {
    return stages.findIndex(s => s.id === stageId) + 1;
  };

  return (
    <Card className={`bg-white rounded-2xl shadow-md p-6 sticky top-6 ${className}`}>
      <h3 className="font-semibold text-lg mb-4">Your Journey Progress</h3>
      
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="relative">
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                ${stage.completed ? 'bg-green-500 text-white' : 
                  stage.current ? 'bg-indigo-500 text-white animate-pulse' : 
                  'bg-gray-200 text-gray-400'}
              `}>
                {stage.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  getStageNumber(stage.id)
                )}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${!stage.completed && !stage.current ? 'text-gray-400' : 'text-gray-900'}`}>
                  {stage.title}
                </div>
                <div className="text-sm text-gray-500">
                  {stage.completed ? 'Completed' : stage.current ? 'Current Stage' : stage.description}
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div className={`
                w-0.5 h-8 ml-5 mt-1
                ${stage.completed || stage.current ? 'bg-indigo-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Topic Progress (if provided) */}
      {topic && totalArticlesInTopic && currentPosition && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-2">
            {topic} Progress
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{currentPosition} of {totalArticlesInTopic} articles</span>
            <span>{Math.round((currentPosition / totalArticlesInTopic) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPosition / totalArticlesInTopic) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* CTA Button */}
      <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors">
        Continue Journey
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  );
};

export default QAJourneyProgress;