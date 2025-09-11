import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Mail, Loader2, Bot, User } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ConversationState {
  leadId?: string;
  stage: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isComplete: boolean;
}

const AIConversationBot = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<ConversationState>({
    stage: 'welcome',
    isComplete: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start with a welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      content: "Hi there 👋 I'm your AI advisor for Costa del Sol properties. I'm excited to help you find your dream home! May I start by getting your first name?",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Extract information based on current stage
    let stageData = {};
    if (conversation.stage === 'first_name' || conversation.stage === 'welcome') {
      stageData = { firstName: inputValue.trim() };
    } else if (conversation.stage === 'last_name') {
      stageData = { lastName: inputValue.trim() };
    } else if (conversation.stage === 'email') {
      stageData = { email: inputValue.trim() };
    } else if (conversation.stage === 'phone') {
      stageData = { phone: inputValue.trim() };
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-advisor-chat', {
        body: {
          leadId: conversation.leadId,
          message: inputValue.trim(),
          stage: conversation.stage,
          ...stageData,
        },
      });

      if (error) throw error;

      // Add typing delay for more natural feel
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation state
      setConversation(prev => ({
        ...prev,
        leadId: data.leadId,
        stage: data.nextStage,
        isComplete: data.isComplete,
        ...stageData,
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Connection Error",
        description: "Sorry, I'm having trouble connecting. Please try again.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+34952123456';
  };

  const handleGetMatches = async () => {
    toast({
      title: "Matches on the way! 📧",
      description: "We're emailing your custom property matches right now.",
    });
  };

  return (
    <Card className="glass-effect border-white/20 shadow-2xl max-w-4xl mx-auto">
      <div className="p-6 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="p-2 bg-primary/20 rounded-full">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Property Advisor</h3>
            <p className="text-sm text-white/70">Costa del Sol Expert</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Completion CTAs */}
        {conversation.isComplete ? (
          <div className="space-y-3 mb-4">
            <div className="text-center text-white/90 text-sm mb-4">
              🎉 Perfect! Your information has been saved.
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCallNow}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                📞 Call Me Now
              </Button>
              <Button
                onClick={handleGetMatches}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <Mail className="h-4 w-4 mr-2" />
                📩 Get My Matches
              </Button>
            </div>
          </div>
        ) : (
          /* Input Area */
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send'
              )}
            </Button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <details className="text-white/70">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Quick Questions
            </summary>
            <div className="text-xs space-y-1 pl-4">
              <div>• Is buying safe for foreigners? Yes, completely legal and secure</div>
              <div>• Can I book virtual tours? Absolutely, we offer live video tours</div>
              <div>• Financing options? We work with international mortgage providers</div>
            </div>
          </details>
        </div>
      </div>
    </Card>
  );
};

export default AIConversationBot;