// Schema Validation and Testing Utilities for AI/LLM Optimization

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

// Validate JSON-LD schema for AI citability
export const validateSchemaForAI = (schema: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // Required fields for AI citation
  if (!schema['@context']) errors.push('Missing @context');
  if (!schema['@type']) errors.push('Missing @type');
  
  // AI-friendly structure checks
  if (schema.speakable) score += 15;
  if (schema.potentialAction) score += 10;
  if (schema.about) score += 10;
  if (schema.mentions) score += 5;
  
  // Content quality checks
  if (schema.mainEntity?.acceptedAnswer?.text) {
    const textLength = schema.mainEntity.acceptedAnswer.text.length;
    if (textLength > 100) score += 10;
    if (textLength > 300) score += 5;
  }
  
  // Multilingual support
  if (schema.inLanguage) score += 5;
  if (schema.availableLanguage) score += 10;
  
  // Location specificity
  if (schema.about?.some((item: any) => item['@type'] === 'Place')) score += 10;
  
  // Authority signals
  if (schema.author || schema.publisher) score += 10;
  if (schema.reviewedBy) score += 5;
  
  // Voice search optimization
  if (schema.speakable?.cssSelector?.length > 3) score += 10;
  if (schema.speakable?.xpath?.length > 3) score += 5;

  // Warnings for optimization
  if (score < 50) warnings.push('Schema could benefit from more AI-friendly properties');
  if (!schema.speakable) warnings.push('Consider adding speakable schema for voice search');
  if (!schema.potentialAction) warnings.push('Add potentialAction for better AI integration');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.min(100, score)
  };
};

// Test schema against common LLM citation patterns
export const testLLMCitation = (schema: any): {
  citationScore: number;
  recommendations: string[];
} => {
  let citationScore = 0;
  const recommendations: string[] = [];

  // Check for clear question-answer structure
  if (schema['@type']?.includes('Question') || schema.mainEntity?.['@type'] === 'Question') {
    citationScore += 20;
  } else {
    recommendations.push('Use Question schema type for better LLM understanding');
  }

  // Check for structured answer
  if (schema.mainEntity?.acceptedAnswer || schema.acceptedAnswer) {
    citationScore += 20;
  }

  // Check for authority indicators
  if (schema.author?.knowsAbout || schema.publisher?.knowsAbout) {
    citationScore += 15;
  } else {
    recommendations.push('Add knowsAbout properties to establish domain authority');
  }

  // Check for location context
  if (schema.about?.some((item: any) => item['@type'] === 'Place' && item.geo)) {
    citationScore += 15;
  } else {
    recommendations.push('Add geographic context with Place schema and coordinates');
  }

  // Check for content accessibility
  if (schema.isAccessibleForFree !== false) {
    citationScore += 10;
  }

  // Check for relationship indicators
  if (schema.isPartOf || schema.citation) {
    citationScore += 10;
  } else {
    recommendations.push('Add isPartOf or citation properties to show content relationships');
  }

  // Check for audience specification
  if (schema.audience) {
    citationScore += 10;
  } else {
    recommendations.push('Specify target audience for better relevance matching');
  }

  return {
    citationScore: Math.min(100, citationScore),
    recommendations
  };
};

// Monitor schema performance
export const trackSchemaPerformance = (articleSlug: string, schemaType: string) => {
  // Log schema deployment for analytics
  console.log(`Schema deployed: ${schemaType} for ${articleSlug}`);
  
  // In production, this would send to analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'schema_deployed', {
      article_slug: articleSlug,
      schema_type: schemaType,
      timestamp: new Date().toISOString()
    });
  }
};

// Validate speakable content
export const validateSpeakableContent = (selectors: string[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // Check for essential selectors
  const essentialSelectors = ['h1', 'h2', '.short-answer'];
  essentialSelectors.forEach(selector => {
    if (selectors.includes(selector)) score += 20;
    else warnings.push(`Consider adding ${selector} to speakable selectors`);
  });

  // Check for voice-friendly content selectors
  const voiceFriendly = ['.question-title', '.quick-answer', '.key-points'];
  voiceFriendly.forEach(selector => {
    if (selectors.includes(selector)) score += 10;
  });

  if (selectors.length > 8) {
    warnings.push('Too many speakable selectors may dilute focus');
  }

  if (selectors.length < 3) {
    warnings.push('Add more speakable selectors for better voice search coverage');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings, 
    score: Math.min(100, score)
  };
};

// Generate schema testing report
export const generateSchemaReport = (schemas: any[]): {
  overallScore: number;
  totalSchemas: number;
  validSchemas: number;
  recommendations: string[];
} => {
  const results = schemas.map(validateSchemaForAI);
  const citationResults = schemas.map(testLLMCitation);
  
  const validSchemas = results.filter(r => r.isValid).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const averageCitationScore = citationResults.reduce((sum, r) => sum + r.citationScore, 0) / citationResults.length;
  
  const allRecommendations = [
    ...results.flatMap(r => r.warnings),
    ...citationResults.flatMap(r => r.recommendations)
  ];
  
  const uniqueRecommendations = [...new Set(allRecommendations)];

  return {
    overallScore: Math.round((averageScore + averageCitationScore) / 2),
    totalSchemas: schemas.length,
    validSchemas,
    recommendations: uniqueRecommendations.slice(0, 5) // Top 5 recommendations
  };
};