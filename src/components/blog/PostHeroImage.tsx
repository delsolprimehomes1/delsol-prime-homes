import React from 'react';

interface PostHeroImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export const PostHeroImage: React.FC<PostHeroImageProps> = ({
  src,
  alt,
  title,
  className = ''
}) => {
  return (
    <div className={`relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg ${className}`}>
      <img 
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Optional title overlay */}
      {title && (
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg">
            {title}
          </h1>
        </div>
      )}
    </div>
  );
};