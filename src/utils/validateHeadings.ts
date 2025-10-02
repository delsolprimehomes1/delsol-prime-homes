// Heading hierarchy validation for SEO compliance
// Enforces: ONE H1 per page, no skipped levels (H2 → H4)

export interface HeadingViolation {
  type: 'multiple-h1' | 'skipped-level' | 'missing-h1';
  message: string;
  line?: number;
  heading?: string;
}

export interface HeadingValidationResult {
  isValid: boolean;
  violations: HeadingViolation[];
  headingStructure: { level: number; text: string; line?: number }[];
}

/**
 * Validates heading hierarchy in markdown or HTML content
 * @param content - Markdown or HTML content to validate
 * @param contentType - 'markdown' or 'html'
 * @returns Validation result with violations
 */
export const validateHeadingHierarchy = (
  content: string,
  contentType: 'markdown' | 'html' = 'markdown'
): HeadingValidationResult => {
  const violations: HeadingViolation[] = [];
  const headingStructure: { level: number; text: string; line?: number }[] = [];

  if (contentType === 'markdown') {
    return validateMarkdownHeadings(content);
  } else {
    return validateHTMLHeadings(content);
  }
};

/**
 * Validate heading hierarchy in markdown content
 */
const validateMarkdownHeadings = (content: string): HeadingValidationResult => {
  const violations: HeadingViolation[] = [];
  const headingStructure: { level: number; text: string; line?: number }[] = [];
  
  const lines = content.split('\n');
  let h1Count = 0;
  let previousLevel = 0;

  lines.forEach((line, index) => {
    // Match markdown headings (# Heading)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const lineNumber = index + 1;

      headingStructure.push({ level, text, line: lineNumber });

      // Check for multiple H1s
      if (level === 1) {
        h1Count++;
        if (h1Count > 1) {
          violations.push({
            type: 'multiple-h1',
            message: `Multiple H1 headings found. Only one H1 is allowed per page. Found: "${text}"`,
            line: lineNumber,
            heading: text
          });
        }
      }

      // Check for skipped levels (e.g., H2 → H4)
      if (previousLevel > 0 && level > previousLevel + 1) {
        violations.push({
          type: 'skipped-level',
          message: `Skipped heading level: jumped from H${previousLevel} to H${level}. Expected H${previousLevel + 1}. Heading: "${text}"`,
          line: lineNumber,
          heading: text
        });
      }

      previousLevel = level;
    }
  });

  // Check for missing H1
  if (h1Count === 0) {
    violations.push({
      type: 'missing-h1',
      message: 'No H1 heading found. Every page must have exactly one H1 heading.'
    });
  }

  return {
    isValid: violations.filter(v => v.type === 'multiple-h1').length === 0,
    violations,
    headingStructure
  };
};

/**
 * Validate heading hierarchy in HTML content
 */
const validateHTMLHeadings = (content: string): HeadingValidationResult => {
  const violations: HeadingViolation[] = [];
  const headingStructure: { level: number; text: string }[] = [];
  
  // Match all heading tags (h1-h6)
  const headingRegex = /<h([1-6])[^>]*>(.+?)<\/h\1>/gi;
  const matches = [...content.matchAll(headingRegex)];
  
  let h1Count = 0;
  let previousLevel = 0;

  matches.forEach((match) => {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]+>/g, '').trim(); // Strip HTML tags
    
    headingStructure.push({ level, text });

    // Check for multiple H1s
    if (level === 1) {
      h1Count++;
      if (h1Count > 1) {
        violations.push({
          type: 'multiple-h1',
          message: `Multiple H1 headings found. Only one H1 is allowed per page. Found: "${text}"`,
          heading: text
        });
      }
    }

    // Check for skipped levels
    if (previousLevel > 0 && level > previousLevel + 1) {
      violations.push({
        type: 'skipped-level',
        message: `Skipped heading level: jumped from H${previousLevel} to H${level}. Expected H${previousLevel + 1}. Heading: "${text}"`,
        heading: text
      });
    }

    previousLevel = level;
  });

  // Check for missing H1
  if (h1Count === 0) {
    violations.push({
      type: 'missing-h1',
      message: 'No H1 heading found. Every page must have exactly one H1 heading.'
    });
  }

  return {
    isValid: violations.filter(v => v.type === 'multiple-h1').length === 0,
    violations,
    headingStructure
  };
};

/**
 * Batch validate multiple articles
 */
export const batchValidateHeadings = (
  articles: Array<{ id: string; title: string; content: string; slug: string }>
): Record<string, HeadingValidationResult> => {
  const results: Record<string, HeadingValidationResult> = {};

  articles.forEach(article => {
    results[article.slug] = validateHeadingHierarchy(article.content, 'markdown');
  });

  return results;
};

/**
 * Get validation summary for reporting
 */
export const getValidationSummary = (results: Record<string, HeadingValidationResult>) => {
  let totalArticles = 0;
  let validArticles = 0;
  let multipleH1Issues = 0;
  let skippedLevelIssues = 0;
  let missingH1Issues = 0;

  Object.values(results).forEach(result => {
    totalArticles++;
    if (result.isValid && result.violations.length === 0) {
      validArticles++;
    }
    multipleH1Issues += result.violations.filter(v => v.type === 'multiple-h1').length;
    skippedLevelIssues += result.violations.filter(v => v.type === 'skipped-level').length;
    missingH1Issues += result.violations.filter(v => v.type === 'missing-h1').length;
  });

  return {
    totalArticles,
    validArticles,
    invalidArticles: totalArticles - validArticles,
    multipleH1Issues,
    skippedLevelIssues,
    missingH1Issues,
    complianceRate: totalArticles > 0 ? (validArticles / totalArticles) * 100 : 0
  };
};

/**
 * Fix heading hierarchy automatically (basic fixes)
 */
export const autoFixHeadings = (content: string): string => {
  let fixed = content;
  const lines = fixed.split('\n');
  let h1Found = false;
  let previousLevel = 0;

  const fixedLines = lines.map(line => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      // Remove duplicate H1s (keep first, demote rest to H2)
      if (level === 1) {
        if (h1Found) {
          return `## ${text}`;
        }
        h1Found = true;
      }

      // Fix skipped levels
      if (previousLevel > 0 && level > previousLevel + 1) {
        const correctedLevel = previousLevel + 1;
        previousLevel = correctedLevel;
        return `${'#'.repeat(correctedLevel)} ${text}`;
      }

      previousLevel = level;
    }

    return line;
  });

  return fixedLines.join('\n');
};

export default {
  validateHeadingHierarchy,
  batchValidateHeadings,
  getValidationSummary,
  autoFixHeadings
};
