import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MessageCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationStage {
  stage: string;
  userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

const BookViewing = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi there 👋 I'm your AI advisor for Del Sol Prime Homes. Ready to explore luxury properties on the Costa del Sol?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [conversationStage, setConversationStage] = useState<ConversationStage>({
    stage: 'welcome',
    userData: {}
  });
  const [isCompleted, setIsCompleted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const parseUserData = (message: string, stage: string) => {
    const userData = { ...conversationStage.userData };
    
    switch (stage) {
      case 'welcome':
        userData.firstName = message.trim();
        break;
      case 'first_name':
        userData.lastName = message.trim();
        break;
      case 'last_name':
        userData.email = message.trim();
        break;
      case 'email':
        userData.phone = message.trim();
        break;
    }
    
    return userData;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Parse user data based on current stage
    const updatedUserData = parseUserData(userMessage, conversationStage.stage);

    try {
      setIsTyping(true);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('ai-advisor-chat', {
        body: {
          leadId,
          message: userMessage,
          stage: conversationStage.stage,
          userData: updatedUserData
        }
      });

      if (error) throw error;

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);

      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update conversation state
      setLeadId(data.leadId);
      setConversationStage({
        stage: data.nextStage,
        userData: updatedUserData
      });
      setIsCompleted(data.isCompleted);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having a connection issue. Let me connect you with our team who can help you immediately!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Please try again or contact our team directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCallNow = () => {
    window.location.href = 'tel:+34952123456';
  };

  const handleGetMatches = () => {
    toast({
      title: "Custom Matches Coming Your Way!",
      description: "We're preparing your personalized property matches and will email them to you shortly.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Book A Viewing | AI Property Advisor - Del Sol Prime Homes</title>
        <meta name="description" content="Chat with our AI advisor to find your perfect Costa del Sol property. Get personalized recommendations and book your viewing today." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              🏝️ Ready to Begin Your Costa Del Sol Journey?
            </h1>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              Let our AI Advisor answer your questions, guide your discovery, and match you with the perfect property.
            </p>
          </div>

          {/* Main Chat Interface */}
          <Card className="glass-effect border-primary/20 shadow-2xl mb-8">
            <CardContent className="p-0">
              {/* Messages Container */}
              <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 shadow-md",
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-4'
                          : 'bg-secondary/20 text-foreground mr-4 border border-secondary/30'
                      )}
                    >
                      <p className="body-base">{message.content}</p>
                      <div className={cn(
                        "text-xs mt-1 opacity-70",
                        message.role === 'user' ? 'text-right' : 'text-left'
                      )}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/20 text-foreground mr-4 border border-secondary/30 rounded-lg px-4 py-2 shadow-md">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Section */}
              {!isCompleted && (
                <div className="border-t border-primary/20 p-4">
                  <div className="flex space-x-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1 border-primary/30 focus:border-primary"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Completion CTAs */}
              {isCompleted && (
                <div className="border-t border-primary/20 p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="text-center space-y-4">
                    <p className="body-lg font-semibold text-primary">
                      🎉 You're all set! Our expert team will be in touch shortly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={handleCallNow}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        📞 Call Me Now
                      </Button>
                      <Button
                        onClick={handleGetMatches}
                        variant="secondary"
                        className="bg-secondary hover:bg-secondary/90"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        📩 Get My Matches
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-6 text-sm text-muted-foreground">
              <span>✅ 200+ Successful Viewings</span>
              <span>⭐ 5-Star Reviews</span>
              <span>🏆 Local Experts</span>
            </div>
            
            {/* Mini FAQ */}
            <details className="max-w-md mx-auto">
              <summary className="cursor-pointer text-primary hover:text-primary/80 font-medium">
                Quick FAQ ↓
              </summary>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground text-left">
                <div>
                  <strong>Is the buying process safe for foreigners?</strong>
                  <p>Absolutely! We guide international buyers through every legal step.</p>
                </div>
                <div>
                  <strong>Can I book a virtual tour from abroad?</strong>
                  <p>Yes! We offer comprehensive virtual tours and video calls.</p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookViewing;