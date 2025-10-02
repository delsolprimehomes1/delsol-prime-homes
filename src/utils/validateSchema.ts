/**
 * Schema validation utilities for Google Rich Results and structured data testing
 */

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

interface SchemaTest {
  type: string;
  passed: boolean;
  message: string;
}

/**
 * Validate schema structure and required fields
 */
export function validateSchema(schema: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check @context
  if (!schema['@context']) {
    errors.push('Missing @context property');
    score -= 20;
  } else if (schema['@context'] !== 'https://schema.org') {
    warnings.push('Unexpected @context value');
    score -= 5;
  }

  // Check for @graph structure
  if (schema['@graph']) {
    const graphItems = schema['@graph'];
    if (!Array.isArray(graphItems)) {
      errors.push('@graph must be an array');
      score -= 20;
    } else {
      // Validate each item in the graph
      graphItems.forEach((item, index) => {
        const itemResult = validateSchemaItem(item, `@graph[${index}]`);
        errors.push(...itemResult.errors);
        warnings.push(...itemResult.warnings);
        score -= (100 - itemResult.score) / graphItems.length;
      });
    }
  } else {
    // Single schema item
    const itemResult = validateSchemaItem(schema, 'root');
    errors.push(...itemResult.errors);
    warnings.push(...itemResult.warnings);
    score -= (100 - itemResult.score);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, Math.round(score))
  };
}

/**
 * Validate individual schema item
 */
function validateSchemaItem(item: any, path: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check @type
  if (!item['@type']) {
    errors.push(`${path}: Missing @type property`);
    score -= 30;
    return { valid: false, errors, warnings, score: 0 };
  }

  const type = item['@type'];

  // Type-specific validation
  switch (type) {
    case 'QAPage':
      score -= validateQAPage(item, path, errors, warnings);
      break;
    case 'BlogPosting':
      score -= validateBlogPosting(item, path, errors, warnings);
      break;
    case 'FAQPage':
      score -= validateFAQPage(item, path, errors, warnings);
      break;
    case 'Place':
      score -= validatePlace(item, path, errors, warnings);
      break;
    case 'BreadcrumbList':
      score -= validateBreadcrumbList(item, path, errors, warnings);
      break;
    case 'Organization':
    case 'RealEstateAgent':
      score -= validateOrganization(item, path, errors, warnings);
      break;
    default:
      warnings.push(`${path}: Unrecognized schema type: ${type}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
}

/**
 * Validate QAPage schema
 */
function validateQAPage(item: any, path: string, errors: string[], warnings: string[]): number {
  let penalty = 0;

  if (!item.headline) {
    errors.push(`${path}: QAPage missing headline`);
    penalty += 15;
  }
  if (!item.author) {
    errors.push(`${path}: QAPage missing author`);
    penalty += 10;
  }
  if (!item.datePublished) {
    warnings.push(`${path}: QAPage missing datePublished`);
    penalty += 5;
  }
  if (!item.speakable) {
    warnings.push(`${path}: QAPage missing speakable content`);
    penalty += 10;
  }

  return penalty;
}

/**
 * Validate BlogPosting schema
 */
function validateBlogPosting(item: any, path: string, errors: string[], warnings: string[]): number {
  let penalty = 0;

  if (!item.headline) {
    errors.push(`${path}: BlogPosting missing headline`);
    penalty += 15;
  }
  if (!item.author) {
    errors.push(`${path}: BlogPosting missing author`);
    penalty += 10;
  }
  if (!item.publisher) {
    errors.push(`${path}: BlogPosting missing publisher`);
    penalty += 10;
  }
  if (!item.datePublished) {
    errors.push(`${path}: BlogPosting missing datePublished`);
    penalty += 10;
  }
  if (!item.image) {
    warnings.push(`${path}: BlogPosting missing image`);
    penalty += 5;
  }

  return penalty;
}

/**
 * Validate FAQPage schema
 */
function validateFAQPage(item: any, path: string, errors: string[], warnings: string[]): number {
  let penalty = 0;

  if (!item.mainEntity) {
    errors.push(`${path}: FAQPage missing mainEntity`);
    penalty += 20;
  } else if (!Array.isArray(item.mainEntity) || item.mainEntity.length === 0) {
    errors.push(`${path}: FAQPage mainEntity must be a non-empty array`);
    penalty += 20;
  } else {
    // Validate each question
    item.mainEntity.forEach((q: any, i: number) => {
      if (q['@type'] !== 'Question') {
        errors.push(`${path}: mainEntity[${i}] must be of type Question`);
        penalty += 5;
      }
      if (!q.name) {
        errors.push(`${path}: mainEntity[${i}] missing question name`);
        penalty += 5;
      }
      if (!q.acceptedAnswer) {
        errors.push(`${path}: mainEntity[${i}] missing acceptedAnswer`);
        penalty += 5;
      }
    });
  }

  return penalty;
}

/**
 * Validate Place schema
 */
function validatePlace(item: any, path: string, errors: string[], warnings: string[]): number {
  let penalty = 0;

  if (!item.name) {
    errors.push(`${path}: Place missing name`);
    penalty += 10;
  }
  if (!item.geo) {
    warnings.push(`${path}: Place missing geo coordinates`);
    penalty += 5;
  } else {
    if (!item.geo.latitude || !item.geo.longitude) {
      errors.push(`${path}: Place geo missing latitude or longitude`);
      penalty += 10;
    }
  }

  return penalty;
}

/**
 * Validate BreadcrumbList schema
 */
function validateBreadcrumbList(item: any, path: string, errors: string[], warnings: string[]): number {
  let penalty = 0;

  if (!item.itemListElement) {
    errors.push(`${path}: BreadcrumbList missing itemListElement`);
    penalty += 20;
  } else if (!Array.isArray(item.itemListElement)) {
    errors.push(`${path}: BreadcrumbList itemListElement must be an array`);
    penalty += 20;
  }

  return penalty;
}

/**
 * Validate Organization schema
 */
function validateOrganization(item: any, path: string, errors: string[], warnings: string[]): number {
  let penalty = 0;

  if (!item.name) {
    errors.push(`${path}: Organization missing name`);
    penalty += 10;
  }
  if (!item.url) {
    warnings.push(`${path}: Organization missing url`);
    penalty += 5;
  }
  if (!item.logo) {
    warnings.push(`${path}: Organization missing logo`);
    penalty += 5;
  }

  return penalty;
}

/**
 * Test schema with Google Rich Results Test API (conceptual)
 */
export function testRichResults(url: string): Promise<SchemaTest[]> {
  // Note: This is a placeholder for actual Google Rich Results Test API integration
  // In production, you would call: https://search.google.com/test/rich-results
  
  return Promise.resolve([
    {
      type: 'validation',
      passed: true,
      message: 'Schema validation would be performed via Google Rich Results Test'
    }
  ]);
}

/**
 * Generate validation report for dashboard
 */
export function generateValidationReport(schemas: any[]): {
  totalSchemas: number;
  validSchemas: number;
  overallScore: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
} {
  let totalScore = 0;
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const recommendations: string[] = [];

  const validSchemas = schemas.filter(schema => {
    const result = validateSchema(schema);
    totalScore += result.score;
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
    return result.valid;
  }).length;

  const overallScore = schemas.length > 0 ? Math.round(totalScore / schemas.length) : 0;

  // Generate recommendations based on common issues
  if (allWarnings.some(w => w.includes('speakable'))) {
    recommendations.push('Add speakable content to improve voice search optimization');
  }
  if (allWarnings.some(w => w.includes('image'))) {
    recommendations.push('Include images in BlogPosting schemas for better rich results');
  }
  if (allErrors.some(e => e.includes('author'))) {
    recommendations.push('Ensure all articles have proper author information');
  }

  return {
    totalSchemas: schemas.length,
    validSchemas,
    overallScore,
    errors: allErrors,
    warnings: allWarnings,
    recommendations: recommendations.slice(0, 5)
  };
}
