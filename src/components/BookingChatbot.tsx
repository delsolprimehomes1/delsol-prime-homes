import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Calendar, CheckCircle, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackCTAClick } from '@/utils/analytics';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface BookingChatbotProps {
  stage: 'exploration' | 'research' | 'decision';
  source: string;
  className?: string;
}

const stageConfig = {
  exploration: {
    title: 'Costa del Sol Property Expert',
    subtitle: 'I can help you discover the perfect property',
    benefits: ['Market insights', 'Location recommendations', 'Investment advice'],
    initialMessage: "Hi! I'm here to help you find your perfect property on the Costa del Sol. What brings you here today?",
    leadType: 'exploration_chat'
  },
  research: {
    title: 'Property Consultation Expert', 
    subtitle: 'Get personalized property recommendations',
    benefits: ['1-on-1 consultation', 'Tailored recommendations', 'Market analysis'],
    initialMessage: "Hello! I can help you explore specific properties and areas. What type of property are you looking for?",
    leadType: 'research_chat'
  },
  decision: {
    title: 'Viewing Specialist',
    subtitle: 'Ready to book your exclusive property viewing?',
    benefits: ['Private tours', 'Expert guidance', 'Legal support'],
    initialMessage: "Welcome! I'm here to help you book an exclusive viewing of hand-selected Costa del Sol properties. Ready to get started?",
    leadType: 'decision_chat'
  }
};

export const BookingChatbot = ({ stage, source, className }: BookingChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<'greeting' | 'collecting_info' | 'booking' | 'complete'>('greeting');
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    requirements: ''
  });
  const [webhookUrl, setWebhookUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const config = stageConfig[stage];

  useEffect(() => {
    // Add initial bot message
    const initialMessage: Message = {
      id: '1',
      content: config.initialMessage,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [config.initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (message: string, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(message, false);
    }, delay);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const message = userInput.trim();
    addMessage(message, true);
    setUserInput('');

    // Process user message based on current step
    if (currentStep === 'greeting') {
      setCurrentStep('collecting_info');
      simulateTyping("Great! To help you better, I'll need a few details. What's your first name?");
    } else if (currentStep === 'collecting_info') {
      await handleInfoCollection(message);
    } else if (currentStep === 'booking') {
      await handleBookingStep(message);
    }
  };

  const handleInfoCollection = async (message: string) => {
    if (!userInfo.firstName) {
      setUserInfo(prev => ({ ...prev, firstName: message }));
      simulateTyping(`Nice to meet you, ${message}! What's your last name?`);
    } else if (!userInfo.lastName) {
      setUserInfo(prev => ({ ...prev, lastName: message }));
      simulateTyping("Perfect! What's your email address?");
    } else if (!userInfo.email) {
      if (!message.includes('@')) {
        simulateTyping("Please provide a valid email address.");
        return;
      }
      setUserInfo(prev => ({ ...prev, email: message }));
      simulateTyping("Great! Could you share your phone number?");
    } else if (!userInfo.phone) {
      setUserInfo(prev => ({ ...prev, phone: message }));
      simulateTyping("Excellent! Tell me a bit about what you're looking for - property type, budget range, preferred areas?");
    } else if (!userInfo.requirements) {
      setUserInfo(prev => ({ ...prev, requirements: message }));
      setCurrentStep('booking');
      
      if (stage === 'decision') {
        simulateTyping("Perfect! I have everything I need. Let me check available viewing slots for this week. Would you prefer a morning or afternoon viewing?", 2000);
      } else {
        simulateTyping("Thank you! Based on your requirements, I'd love to schedule a consultation to show you some perfect matches. When would be a good time this week?", 2000);
      }
    }
  };

  const handleBookingStep = async (message: string) => {
    setCurrentStep('complete');
    
    // Send to n8n webhook if configured
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify({
            ...userInfo,
            stage,
            source,
            leadType: config.leadType,
            preferredTime: message,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Webhook error:', error);
      }
    }

    trackCTAClick('booking_chat', 'appointment_booked', source);

    simulateTyping(`Fantastic! I've scheduled your ${stage === 'decision' ? 'viewing' : 'consultation'} and you'll receive a confirmation email shortly. Our team will contact you within 24 hours to confirm the details. Is there anything else I can help you with?`, 2000);
    
    toast({
      title: "Booking Confirmed! 🎉",
      description: "We'll contact you within 24 hours to confirm your appointment.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Webhook Configuration (for demo) */}
      <Card className="p-4 bg-muted/30">
        <div className="space-y-2">
          <label className="text-sm font-medium">n8n Webhook URL (Optional)</label>
          <Input
            placeholder="https://your-n8n-instance.com/webhook/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Configure your n8n webhook to receive booking data
          </p>
        </div>
      </Card>

      <Card className={`bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Secure & Private</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">24/7 Support</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Instant Booking</span>
              </div>
            </div>

            <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20">
              AI Assistant
            </Badge>
            <h3 className="text-xl font-bold text-foreground mb-2">{config.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{config.subtitle}</p>
            
            <div className="space-y-2">
              {config.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-background/50 rounded-lg border border-border/50 overflow-hidden">
            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  {!message.isUser && (
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.isUser ? 'order-1' : ''}`}>
                    <div className={`p-3 rounded-2xl ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-background border border-border'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    <div className={`text-xs text-muted-foreground mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {message.isUser && (
                    <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  
                  <div className="bg-background border border-border p-3 rounded-2xl">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-muted-foreground">AI is typing</span>
                      <div className="flex space-x-1 ml-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-border/50 p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isTyping}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 pt-4 mt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>+34 123 456 789</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span>info@delsolprimehomes.com</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            No spam, unsubscribe anytime. Your privacy is protected by GDPR compliance.
          </p>
        </CardContent>

        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPoint",
            "contactType": "Real Estate Sales",
            "areaServed": "Costa del Sol, Spain",
            "availableLanguage": ["English", "Spanish", "German", "French", "Dutch"],
            "contactOption": ["TollFree", "HearingImpairedSupported"],
            "email": "info@delsolprimehomes.com",
            "telephone": "+34-123-456-789"
          })
        }} />
      </Card>
    </div>
  );
};