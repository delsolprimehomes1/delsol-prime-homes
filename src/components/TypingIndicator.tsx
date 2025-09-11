import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      
      <div className="bg-white/10 text-white backdrop-blur-sm p-4 rounded-2xl">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-white/70">AI is typing</span>
          <div className="flex space-x-1 ml-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;