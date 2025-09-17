import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Shield, Star, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackCTAClick } from '@/utils/analytics';

interface LeadCaptureFormProps {
  stage: 'TOFU' | 'MOFU' | 'BOFU';
  source: string;
  className?: string;
}

const stageConfig = {
  TOFU: {
    title: 'Get Our Free Costa del Sol Property Guide',
    subtitle: 'Discover insider insights about the best locations and market trends',
    benefits: ['Market Analysis Report', 'Location Comparison Guide', 'Investment Tips'],
    cta: 'Download Free Guide',
    leadType: 'guide_download'
  },
  MOFU: {
    title: 'Schedule Your Free Property Consultation',
    subtitle: 'Get personalized advice from our Costa del Sol experts',
    benefits: ['1-on-1 Expert Consultation', 'Personalized Property Recommendations', 'Market Insights'],
    cta: 'Book Free Consultation',
    leadType: 'consultation_request'
  },
  BOFU: {
    title: 'Book Your Exclusive Property Viewing',
    subtitle: 'Private tours of hand-selected Costa del Sol properties',
    benefits: ['Exclusive Property Access', 'Personal Tour Guide', 'Legal Support Included'],
    cta: 'Schedule Viewing',
    leadType: 'viewing_request'
  }
};

export const LeadCaptureForm = ({ stage, source, className }: LeadCaptureFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const config = stageConfig[stage];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          source: `${source} - ${config.leadType}`,
          stage: stage.toLowerCase(),
          conversation_log: [{
            timestamp: new Date().toISOString(),
            action: 'form_submission',
            data: {
              form_type: config.leadType,
              source_page: source,
              message: formData.message
            }
          }]
        }]);

      if (error) throw error;

      trackCTAClick('lead_capture', config.cta, source);
      
      toast({
        title: "Success! 🎉",
        description: "We'll contact you within 24 hours with your personalized information.",
      });

      // Reset form
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });

    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 ${className}`}>
      <CardContent className="p-6">
        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Secure & Private</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium">5-Star Rated</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Free Service</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20">
            {stage} Exclusive
          </Badge>
          <h3 className="text-xl font-bold text-foreground mb-2">{config.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{config.subtitle}</p>
          
          {/* Benefits */}
          <div className="space-y-2">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              required
              className="bg-background/80"
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              required
              className="bg-background/80"
            />
          </div>
          
          <Input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className="bg-background/80"
          />
          
          <Input
            type="tel"
            placeholder="Phone Number (Optional)"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="bg-background/80"
          />

          {stage !== 'TOFU' && (
            <Textarea
              placeholder="Tell us about your property requirements..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="bg-background/80 min-h-[80px]"
            />
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : config.cta}
          </Button>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>+34 123 456 789</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span>info@delsolprimehomes.com</span>
            </div>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          No spam, unsubscribe anytime. Your privacy is protected by GDPR compliance.
        </p>
      </CardContent>

      {/* Structured Data for Lead Generation */}
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
  );
};