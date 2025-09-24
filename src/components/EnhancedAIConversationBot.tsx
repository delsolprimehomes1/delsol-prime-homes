// Enhanced AI Conversation Bot with n8n/GHL Integration
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  MessageCircle, 
  Send, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIntegrationManager, AppointmentBookingData } from '@/utils/n8n-ghl-integration';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  intent?: string;
}

interface ConversationState {
  stage: 'welcome' | 'gathering_info' | 'booking_details' | 'confirmation' | 'completed';
  leadInfo: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    preferredDate?: string;
    preferredTime?: string;
    message?: string;
  };
  clusterContext?: {
    clusterTitle?: string;
    questionTitle?: string;
    funnelStage?: 'TOFU' | 'MOFU' | 'BOFU';
  };
}

interface EnhancedAIConversationBotProps {
  initialContext?: {
    clusterTitle?: string;
    questionTitle?: string;
    funnelStage?: 'TOFU' | 'MOFU' | 'BOFU';
  };
  onConversationComplete?: (leadInfo: any) => void;
}

const EnhancedAIConversationBot: React.FC<EnhancedAIConversationBotProps> = ({
  initialContext,
  onConversationComplete
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'welcome',
    leadInfo: {},
    clusterContext: initialContext
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { triggerAppointmentBooking, triggerConversationComplete } = useIntegrationManager();
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initialize conversation
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([{
      id: '1',
      content: welcomeMessage,
      isUser: false,
      timestamp: new Date()
    }]);
  }, [initialContext]);

  const getWelcomeMessage = (): string => {
    const { clusterContext } = conversationState;
    
    if (clusterContext?.funnelStage === 'BOFU') {
      return `Hi! I see you're interested in "${clusterContext.questionTitle}". I'm here to help you schedule a consultation with our Costa del Sol property experts. Let's get started! 

What's your first name?`;
    }

    return `Hello! Welcome to DelSolPrimeHomes. I'm your AI assistant, ready to help you with Costa del Sol property questions and schedule consultations. 

${clusterContext?.questionTitle ? `I see you're interested in "${clusterContext.questionTitle}". ` : ''}

How can I assist you today?`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Process user input based on conversation stage
      const response = await processUserInput(userMessage.content, conversationState);
      
      setIsTyping(false);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isUser: false,
        timestamp: new Date(),
        intent: response.intent
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationState(response.newState);

      // Handle booking completion
      if (response.newState.stage === 'completed') {
        await handleBookingCompletion(response.newState);
      }

    } catch (error) {
      setIsTyping(false);
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again or contact us directly.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processUserInput = async (input: string, currentState: ConversationState): Promise<{
    message: string;
    newState: ConversationState;
    intent?: string;
  }> => {
    const { stage, leadInfo } = currentState;

    switch (stage) {
      case 'welcome':
        return {
          message: "Great! To help you better, could you please tell me your first name?",
          newState: { ...currentState, stage: 'gathering_info' }
        };

      case 'gathering_info':
        return await handleInfoGathering(input, currentState);

      case 'booking_details':
        return await handleBookingDetails(input, currentState);

      default:
        return {
          message: "Thank you for your interest. Our team will contact you soon!",
          newState: currentState
        };
    }
  };

  const handleInfoGathering = async (input: string, currentState: ConversationState): Promise<{
    message: string;
    newState: ConversationState;
    intent?: string;
  }> => {
    const { leadInfo } = currentState;

    if (!leadInfo.firstName) {
      return {
        message: `Nice to meet you, ${input}! What's your last name?`,
        newState: {
          ...currentState,
          leadInfo: { ...leadInfo, firstName: input }
        }
      };
    }

    if (!leadInfo.lastName) {
      return {
        message: `Perfect, ${leadInfo.firstName} ${input}! Could you please provide your email address?`,
        newState: {
          ...currentState,
          leadInfo: { ...leadInfo, lastName: input }
        }
      };
    }

    if (!leadInfo.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        return {
          message: "Please provide a valid email address.",
          newState: currentState
        };
      }

      return {
        message: `Great! And your phone number?`,
        newState: {
          ...currentState,
          leadInfo: { ...leadInfo, email: input }
        }
      };
    }

    if (!leadInfo.phone) {
      return {
        message: `Excellent! Now, would you like to schedule a consultation? If so, what date would work best for you? (Please provide in DD/MM/YYYY format)`,
        newState: {
          ...currentState,
          leadInfo: { ...leadInfo, phone: input },
          stage: 'booking_details'
        }
      };
    }

    return {
      message: "Thank you for providing your information!",
      newState: currentState
    };
  };

  const handleBookingDetails = async (input: string, currentState: ConversationState): Promise<{
    message: string;
    newState: ConversationState;
    intent?: string;
  }> => {
    const { leadInfo } = currentState;

    if (!leadInfo.preferredDate) {
      const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (!dateRegex.test(input)) {
        return {
          message: "Please provide the date in DD/MM/YYYY format (e.g., 25/12/2024).",
          newState: currentState
        };
      }

      return {
        message: `Perfect! What time would be convenient for you? (e.g., 10:00 AM, 2:30 PM)`,
        newState: {
          ...currentState,
          leadInfo: { ...leadInfo, preferredDate: input }
        }
      };
    }

    if (!leadInfo.preferredTime) {
      return {
        message: `Excellent! Is there anything specific you'd like to discuss during the consultation?`,
        newState: {
          ...currentState,
          leadInfo: { ...leadInfo, preferredTime: input }
        }
      };
    }

    return {
      message: `Perfect! I have all the information I need. Let me schedule your consultation right away...`,
      newState: {
        ...currentState,
        leadInfo: { ...leadInfo, message: input },
        stage: 'completed'
      },
      intent: 'booking_complete'
    };
  };

  const handleBookingCompletion = async (finalState: ConversationState) => {
    try {
      const { leadInfo, clusterContext } = finalState;

      // Create booking data
      const bookingData: AppointmentBookingData = {
        firstName: leadInfo.firstName || '',
        lastName: leadInfo.lastName || '',
        email: leadInfo.email || '',
        phone: leadInfo.phone || '',
        preferredDate: leadInfo.preferredDate,
        preferredTime: leadInfo.preferredTime,
        message: leadInfo.message,
        source: 'Enhanced AI Chatbot',
        funnelStage: clusterContext?.funnelStage || 'BOFU',
        clusterTitle: clusterContext?.clusterTitle,
        questionTitle: clusterContext?.questionTitle
      };

      // Trigger n8n/GHL integration
      const result = await triggerAppointmentBooking(bookingData);

      let completionMessage = '';
      if (result.success) {
        completionMessage = `🎉 Wonderful! Your consultation has been scheduled for ${leadInfo.preferredDate} at ${leadInfo.preferredTime}. 

Our team will contact you shortly to confirm the details. You should also receive a confirmation email at ${leadInfo.email}.

We're excited to help you with your Costa del Sol property journey!`;

        toast({
          title: "Booking Successful!",
          description: `Consultation scheduled for ${leadInfo.firstName} ${leadInfo.lastName}`,
        });
      } else {
        completionMessage = `Thank you ${leadInfo.firstName}! We've received your information and booking request. Our team will contact you within 24 hours to confirm your consultation details.

We appreciate your interest in Costa del Sol properties!`;

        toast({
          title: "Information Received",
          description: "Our team will contact you soon to schedule your consultation.",
          variant: "default",
        });
      }

      // Add completion message
      const completionMsg: Message = {
        id: (Date.now() + 2).toString(),
        content: completionMessage,
        isUser: false,
        timestamp: new Date(),
        intent: 'booking_confirmed'
      };

      setMessages(prev => [...prev, completionMsg]);

      // Store lead in database
      await supabase.from('leads').insert([{
        first_name: leadInfo.firstName,
        last_name: leadInfo.lastName,
        email: leadInfo.email,
        phone: leadInfo.phone,
        source: 'Enhanced AI Chatbot',
        stage: 'consultation_requested',
        conversation_log: messages.map(m => ({
          message: m.content,
          sender: m.isUser ? 'user' : 'ai',
          timestamp: m.timestamp.toISOString(),
          intent: m.intent
        }))
      }]);

      // Trigger conversation completion webhook
      await triggerConversationComplete({
        leadId: leadInfo.email || Date.now().toString(),
        conversationLog: messages.map(m => ({
          message: m.content,
          sender: m.isUser ? 'user' : 'ai',
          timestamp: m.timestamp.toISOString(),
          intent: m.intent
        })),
        stage: 'completed',
        completedAt: new Date().toISOString()
      });

      // Notify parent component
      if (onConversationComplete) {
        onConversationComplete(finalState.leadInfo);
      }

    } catch (error) {
      console.error('Error completing booking:', error);
      toast({
        title: "Booking Error",
        description: "There was an issue processing your booking. Our team will contact you directly.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStageIcon = () => {
    switch (conversationState.stage) {
      case 'welcome': return <MessageCircle className="h-4 w-4" />;
      case 'gathering_info': return <User className="h-4 w-4" />;
      case 'booking_details': return <Calendar className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStageDescription = () => {
    switch (conversationState.stage) {
      case 'welcome': return 'Getting Started';
      case 'gathering_info': return 'Collecting Information';
      case 'booking_details': return 'Scheduling Consultation';
      case 'completed': return 'Booking Complete';
      default: return 'Chatting';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            AI Property Consultant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getStageIcon()}
              {getStageDescription()}
            </Badge>
          </div>
        </div>
        {conversationState.clusterContext && (
          <div className="text-sm text-muted-foreground">
            Context: {conversationState.clusterContext.questionTitle}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Container */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading || conversationState.stage === 'completed'}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim() || conversationState.stage === 'completed'}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {conversationState.stage === 'completed' && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => window.open('tel:+34123456789')}
              >
                <Phone className="h-3 w-3" />
                Call Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => window.open('mailto:info@delsolprimehomes.com')}
              >
                <Mail className="h-3 w-3" />
                Email Us
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAIConversationBot;