import React from 'react';

interface SpeakableContentProps {
  children: React.ReactNode;
  type?: 'summary' | 'answer' | 'takeaway' | 'content';
  className?: string;
}

/**
 * Wrapper component for speakable content
 * Adds proper CSS classes for voice search optimization
 */
export const SpeakableContent: React.FC<SpeakableContentProps> = ({
  children,
  type = 'content',
  className = ''
}) => {
  const speakableClass = `speakable-${type}`;
  
  return (
    <div 
      className={`${speakableClass} voice-optimized ${className}`}
      data-speakable="true"
      itemProp={type === 'answer' ? 'acceptedAnswer' : undefined}
    >
      {children}
    </div>
  );
};

interface SpeakableSummaryProps {
  summary: string;
  wordCount?: number;
  className?: string;
}

/**
 * Optimized summary block for voice search
 * 40-60 words, natural spoken language
 */
export const SpeakableSummary: React.FC<SpeakableSummaryProps> = ({
  summary,
  wordCount,
  className = ''
}) => {
  return (
    <SpeakableContent type="summary" className={className}>
      <p className="text-lg leading-relaxed text-foreground">
        {summary}
      </p>
      {wordCount && (
        <span className="text-xs text-muted-foreground sr-only">
          {wordCount} words
        </span>
      )}
    </SpeakableContent>
  );
};

interface SpeakableAnswerProps {
  answer: string;
  question?: string;
  className?: string;
}

/**
 * FAQ answer optimized for voice output
 */
export const SpeakableAnswer: React.FC<SpeakableAnswerProps> = ({
  answer,
  question,
  className = ''
}) => {
  return (
    <div className={className}>
      {question && (
        <h3 
          className="text-xl font-semibold mb-3 text-foreground"
          itemProp="name"
        >
          {question}
        </h3>
      )}
      <SpeakableContent type="answer">
        <p className="text-base leading-relaxed text-muted-foreground">
          {answer}
        </p>
      </SpeakableContent>
    </div>
  );
};

interface KeyTakeawaysProps {
  takeaways: string[];
  className?: string;
}

/**
 * Key takeaways formatted for speakable content
 */
export const KeyTakeaways: React.FC<KeyTakeawaysProps> = ({
  takeaways,
  className = ''
}) => {
  return (
    <div className={`key-takeaways speakable-content ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-foreground">
        Key Takeaways
      </h3>
      <ul className="space-y-3" role="list">
        {takeaways.map((takeaway, index) => (
          <li 
            key={index}
            className="flex items-start gap-3"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </span>
            <span className="text-base leading-relaxed text-muted-foreground flex-1">
              {takeaway}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpeakableContent;
