import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

interface BlogPreviewProps {
  title: string;
  content: string;
  author: string;
  featuredImage?: string;
  customCtaText?: string;
  customCtaUrl?: string;
}

export const BlogPreview: React.FC<BlogPreviewProps> = ({
  title,
  content,
  author,
  featuredImage,
  customCtaText,
  customCtaUrl
}) => {
  const formatMarkdown = (text: string) => {
    // Basic markdown formatting for preview
    return text
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3 mt-6">$2</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2 mt-4">$3</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, '<br>');
  };

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (!title && !content) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>Start writing your blog post to see the preview...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-background rounded-lg shadow-sm border">
        {/* Hero Image */}
        {featuredImage && (
          <div className="w-full h-64 md:h-80 overflow-hidden rounded-t-lg">
            <img 
              src={featuredImage} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Header */}
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">Real Estate Guide</Badge>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {title || 'Blog Title'}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{author || 'Author'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{calculateReadingTime(content)} min read</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: `<p class="mb-4">${formatMarkdown(content || 'Your blog content will appear here...')}</p>` 
              }}
            />
          </div>

          {/* Mid-Post CTA */}
          {customCtaText && customCtaUrl && (
            <Card className="my-8 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
                  <p className="text-muted-foreground mb-4">
                    {customCtaText}
                  </p>
                  <Button asChild>
                    <a href={customCtaUrl} target="_blank" rel="noopener noreferrer">
                      Learn More
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Author Bio */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">{author || 'Author Name'}</h4>
                <p className="text-sm text-muted-foreground">
                  Expert real estate advisor specializing in Costa del Sol properties and international relocations.
                </p>
              </div>
            </div>
          </div>

          {/* Related Articles Placeholder */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-xl font-semibold mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Property Investment Guide</h4>
                  <p className="text-sm text-muted-foreground">Everything you need to know about investing in Costa del Sol real estate...</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Moving to Spain Checklist</h4>
                  <p className="text-sm text-muted-foreground">Complete guide for international buyers relocating to Spain...</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};