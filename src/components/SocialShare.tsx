import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import { cn } from '@/lib/utils';

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
  className?: string;
}

export const SocialShare = ({ title, url, description, className }: SocialShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    url,
    text: description || title,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackCTAClick('social_share', 'native_share', url);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleSocialShare = (platform: string, shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    trackCTAClick('social_share', platform, url);
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackCTAClick('social_share', 'copy_link', url);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="flex items-center gap-2 hover:bg-muted/50 transition-all duration-200"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      {/* Share Options (shown when native share not available) */}
      {isOpen && !navigator.share && (
        <Card className="absolute top-full right-0 mt-2 p-4 z-50 bg-background border shadow-lg min-w-[280px]">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-foreground">Share this article</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('facebook', shareLinks.facebook)}
                className="flex items-center gap-2 justify-start"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('twitter', shareLinks.twitter)}
                className="flex items-center gap-2 justify-start"
              >
                <Twitter className="w-4 h-4 text-sky-500" />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('linkedin', shareLinks.linkedin)}
                className="flex items-center gap-2 justify-start"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex items-center gap-2 justify-start"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};