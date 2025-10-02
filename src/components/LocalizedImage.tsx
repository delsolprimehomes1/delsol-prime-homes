import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LocalizedImageProps {
  storagePath: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
}

interface ImageMetadata {
  alt_text: Record<string, string>;
  caption?: Record<string, string>;
  title?: string;
  width?: number;
  height?: number;
  exif_location_name?: string;
}

export const LocalizedImage = ({
  storagePath,
  className = '',
  loading = 'lazy',
  sizes = '100vw',
  priority = false
}: LocalizedImageProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  // Fetch image metadata from database
  useEffect(() => {
    const fetchMetadata = async () => {
      const { data, error } = await supabase
        .from('image_metadata')
        .select('alt_text, caption, title, width, height, exif_location_name')
        .eq('storage_path', storagePath)
        .maybeSingle();

      if (data && !error) {
        setMetadata(data as ImageMetadata);
      }
    };

    fetchMetadata();
  }, [storagePath]);

  // Get public URL from Supabase Storage
  useEffect(() => {
    const getImageUrl = () => {
      // Extract bucket name from storage path (format: bucket/path/to/file)
      const pathParts = storagePath.split('/');
      const bucketName = pathParts[0];
      const filePath = pathParts.slice(1).join('/');

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
    };

    if (storagePath) {
      getImageUrl();
    }
  }, [storagePath]);

  // Get localized alt text with fallback
  const getLocalizedText = (textObj: Record<string, string> | undefined) => {
    if (!textObj) return '';
    
    // Try current language
    if (textObj[currentLanguage]) {
      return textObj[currentLanguage];
    }
    
    // Fallback to English
    if (textObj['en']) {
      return textObj['en'];
    }
    
    // Fallback to first available language
    const firstKey = Object.keys(textObj)[0];
    return textObj[firstKey] || '';
  };

  const altText = getLocalizedText(metadata?.alt_text);
  const caption = getLocalizedText(metadata?.caption);

  // Generate srcset for responsive images
  const generateSrcSet = () => {
    if (!imageUrl) return '';
    
    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .map(width => `${imageUrl}?width=${width} ${width}w`)
      .join(', ');
  };

  const shouldLoad = priority || isIntersecting || loading === 'eager';

  if (!imageUrl || !metadata) {
    return (
      <div
        ref={targetRef as any}
        className={`bg-muted animate-pulse ${className}`}
        style={{
          aspectRatio: metadata?.width && metadata?.height
            ? `${metadata.width} / ${metadata.height}`
            : '16 / 9'
        }}
      />
    );
  }

  return (
    <figure ref={targetRef as any} className="relative">
      {shouldLoad && (
        <img
          ref={imgRef}
          src={imageUrl}
          srcSet={generateSrcSet()}
          sizes={sizes}
          alt={altText}
          title={metadata.title}
          width={metadata.width}
          height={metadata.height}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          itemProp="image"
        />
      )}
      
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground italic text-center">
          {caption}
          {metadata.exif_location_name && (
            <span className="block text-xs mt-1 opacity-75">
              📍 {metadata.exif_location_name}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
};
