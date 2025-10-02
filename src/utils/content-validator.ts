import { ParsedFrontmatter } from './markdown-frontmatter-parser';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number; // 0-100
}

/**
 * Validate frontmatter schema compliance
 */
export function validateFrontmatter(frontmatter: ParsedFrontmatter): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!frontmatter.title || frontmatter.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required',
      severity: 'error',
    });
  }

  if (!frontmatter.slug || frontmatter.slug.trim().length === 0) {
    errors.push({
      field: 'slug',
      message: 'Slug is required',
      severity: 'error',
    });
  } else if (!/^[a-z0-9-]+$/.test(frontmatter.slug)) {
    errors.push({
      field: 'slug',
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      severity: 'error',
    });
  }

  if (!frontmatter.language || frontmatter.language.trim().length === 0) {
    errors.push({
      field: 'language',
      message: 'Language is required',
      severity: 'error',
    });
  }

  if (!frontmatter.funnelStage) {
    errors.push({
      field: 'funnelStage',
      message: 'Funnel stage is required',
      severity: 'error',
    });
  } else if (!['TOFU', 'MOFU', 'BOFU'].includes(frontmatter.funnelStage)) {
    errors.push({
      field: 'funnelStage',
      message: 'Funnel stage must be TOFU, MOFU, or BOFU',
      severity: 'error',
    });
  }

  if (!frontmatter.topic || frontmatter.topic.trim().length === 0) {
    errors.push({
      field: 'topic',
      message: 'Topic is required',
      severity: 'error',
    });
  }

  if (!frontmatter.summary || frontmatter.summary.trim().length === 0) {
    errors.push({
      field: 'summary',
      message: 'Summary is required',
      severity: 'error',
    });
  }

  // SEO validation
  if (!frontmatter.seo) {
    errors.push({
      field: 'seo',
      message: 'SEO metadata is required',
      severity: 'error',
    });
  } else {
    if (!frontmatter.seo.metaTitle || frontmatter.seo.metaTitle.trim().length === 0) {
      errors.push({
        field: 'seo.metaTitle',
        message: 'Meta title is required',
        severity: 'error',
      });
    } else if (frontmatter.seo.metaTitle.length > 60) {
      warnings.push({
        field: 'seo.metaTitle',
        message: 'Meta title should be under 60 characters for optimal SEO',
        severity: 'warning',
      });
    }

    if (!frontmatter.seo.metaDescription || frontmatter.seo.metaDescription.trim().length === 0) {
      errors.push({
        field: 'seo.metaDescription',
        message: 'Meta description is required',
        severity: 'error',
      });
    } else if (frontmatter.seo.metaDescription.length > 160) {
      warnings.push({
        field: 'seo.metaDescription',
        message: 'Meta description should be under 160 characters for optimal SEO',
        severity: 'warning',
      });
    }
  }

  // Voice search optimization
  if (!frontmatter.speakableQuestions || frontmatter.speakableQuestions.length === 0) {
    warnings.push({
      field: 'speakableQuestions',
      message: 'Adding speakable questions improves voice search optimization',
      severity: 'warning',
    });
  }

  if (!frontmatter.speakableAnswer || frontmatter.speakableAnswer.trim().length === 0) {
    warnings.push({
      field: 'speakableAnswer',
      message: 'Adding a speakable answer improves voice search optimization',
      severity: 'warning',
    });
  }

  // E-E-A-T validation
  if (!frontmatter.author) {
    warnings.push({
      field: 'author',
      message: 'Adding author information improves E-E-A-T signals',
      severity: 'warning',
    });
  } else {
    if (!frontmatter.author.credentials) {
      warnings.push({
        field: 'author.credentials',
        message: 'Author credentials strengthen expertise signals',
        severity: 'warning',
      });
    }
  }

  if (!frontmatter.reviewer) {
    warnings.push({
      field: 'reviewer',
      message: 'Content review by an expert improves trustworthiness',
      severity: 'warning',
    });
  }

  // Geo signals
  if (!frontmatter.geo) {
    warnings.push({
      field: 'geo',
      message: 'Adding geo coordinates improves local SEO',
      severity: 'warning',
    });
  }

  // Hero image
  if (!frontmatter.heroImage) {
    warnings.push({
      field: 'heroImage',
      message: 'Hero image improves engagement and social sharing',
      severity: 'warning',
    });
  } else {
    if (!frontmatter.heroImage.alt || frontmatter.heroImage.alt.trim().length === 0) {
      errors.push({
        field: 'heroImage.alt',
        message: 'Hero image alt text is required for accessibility and SEO',
        severity: 'error',
      });
    }
  }

  // Internal linking
  if (!frontmatter.internalLinks || frontmatter.internalLinks.length === 0) {
    warnings.push({
      field: 'internalLinks',
      message: 'Internal links improve site structure and SEO',
      severity: 'warning',
    });
  }

  // Calculate quality score
  const totalChecks = 15;
  const errorWeight = 2;
  const warningWeight = 1;
  const deductions = (errors.length * errorWeight) + (warnings.length * warningWeight);
  const score = Math.max(0, Math.min(100, 100 - (deductions / totalChecks) * 100));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.round(score),
  };
}

/**
 * Validate content quality (markdown content)
 */
export function validateContentQuality(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Content length
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 300) {
    warnings.push({
      field: 'content',
      message: `Content is too short (${wordCount} words). Aim for at least 300 words for better SEO.`,
      severity: 'warning',
    });
  }

  // Heading structure
  const h1Count = (content.match(/^#\s/gm) || []).length;
  if (h1Count === 0) {
    errors.push({
      field: 'content',
      message: 'Content must have at least one H1 heading',
      severity: 'error',
    });
  } else if (h1Count > 1) {
    warnings.push({
      field: 'content',
      message: 'Content should have only one H1 heading for better SEO',
      severity: 'warning',
    });
  }

  const h2Count = (content.match(/^##\s/gm) || []).length;
  if (h2Count === 0) {
    warnings.push({
      field: 'content',
      message: 'Consider adding H2 headings to improve content structure',
      severity: 'warning',
    });
  }

  // Image alt text
  const imagesWithoutAlt = (content.match(/!\[\]\(/g) || []).length;
  if (imagesWithoutAlt > 0) {
    errors.push({
      field: 'content',
      message: `${imagesWithoutAlt} image(s) missing alt text. Alt text is required for accessibility and SEO.`,
      severity: 'error',
    });
  }

  // Internal links
  const internalLinks = (content.match(/\[.*?\]\(\/.*?\)/g) || []).length;
  if (internalLinks === 0) {
    warnings.push({
      field: 'content',
      message: 'Consider adding internal links to related content',
      severity: 'warning',
    });
  }

  // External links
  const externalLinks = (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;
  if (externalLinks === 0) {
    warnings.push({
      field: 'content',
      message: 'Consider adding authoritative external references',
      severity: 'warning',
    });
  }

  // Calculate score
  const totalChecks = 7;
  const errorWeight = 2;
  const warningWeight = 1;
  const deductions = (errors.length * errorWeight) + (warnings.length * warningWeight);
  const score = Math.max(0, Math.min(100, 100 - (deductions / totalChecks) * 100));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.round(score),
  };
}

/**
 * Comprehensive validation combining frontmatter and content
 */
export function validateComplete(
  frontmatter: ParsedFrontmatter,
  content: string
): ValidationResult {
  const frontmatterValidation = validateFrontmatter(frontmatter);
  const contentValidation = validateContentQuality(content);

  return {
    valid: frontmatterValidation.valid && contentValidation.valid,
    errors: [...frontmatterValidation.errors, ...contentValidation.errors],
    warnings: [...frontmatterValidation.warnings, ...contentValidation.warnings],
    score: Math.round((frontmatterValidation.score + contentValidation.score) / 2),
  };
}
