import React from 'react';
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${message.isUser ? 'order-1' : ''}`}>
        <div
          className={`p-4 rounded-2xl ${
            message.isUser
              ? 'bg-primary text-white ml-auto'
              : 'bg-white/10 text-white backdrop-blur-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <div className={`text-xs text-white/50 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {message.isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mt-1">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;