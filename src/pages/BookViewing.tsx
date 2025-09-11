import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import AIConversationBot from '@/components/AIConversationBot';

const BookViewing = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Book A Viewing - AI Advisor | Del Sol Prime Homes</title>
        <meta name="description" content="Speak with our AI advisor to find your perfect Costa del Sol property. Get personalized recommendations and book your viewing today." />
        <meta name="keywords" content="book viewing, Costa del Sol properties, AI advisor, real estate consultation" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-background/80" />
          <div 
            className="w-full h-full bg-cover bg-center bg-fixed filter blur-sm"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=2000&q=80")',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header Section */}
          <div className="text-center pt-20 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="heading-display text-white mb-6">
                🏝️ Ready to Begin Your Costa Del Sol Journey?
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Let our AI Advisor answer your questions, guide your discovery, and match you with the perfect property.
              </p>
            </div>
          </div>

          {/* Main Conversation Area */}
          <div className="flex-1 flex items-center justify-center px-4 pb-20">
            <div className="w-full max-w-4xl">
              <AIConversationBot />
            </div>
          </div>

          {/* Bottom Testimonials */}
          <div className="text-center text-white/80 pb-8 px-4">
            <div className="flex items-center justify-center gap-6 text-sm">
              <span>⭐⭐⭐⭐⭐ 200+ Successful Viewings</span>
              <span>•</span>
              <span>🏆 Trusted by International Buyers</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookViewing;