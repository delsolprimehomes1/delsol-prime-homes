import { createHash } from 'crypto';

export interface FrontmatterSEO {
  metaTitle: string;
  metaDescription: string;
  canonical?: string;
  hreflang?: Array<{ lang: string; url: string }>;
}

export interface FrontmatterAuthor {
  name: string;
  credentials?: string;
  bio?: string;
}

export interface FrontmatterReviewer {
  name: string;
  credentials?: string;
  reviewDate?: string;
}

export interface FrontmatterGeo {
  latitude: number;
  longitude: number;
  address: string;
  areaServed: string[];
}

export interface FrontmatterHeroImage {
  src: string;
  alt: string;
  caption?: string;
  geoCoordinates?: { lat: number; lng: number };
}

export interface FrontmatterInternalLink {
  slug: string;
  anchor: string;
}

export interface FrontmatterNextStep {
  title: string;
  slug: string;
  cta: string;
}

export interface ParsedFrontmatter {
  title: string;
  slug: string;
  language: string;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  topic: string;
  summary: string;
  seo: FrontmatterSEO;
  speakableQuestions?: string[];
  speakableAnswer?: string;
  author?: FrontmatterAuthor;
  reviewer?: FrontmatterReviewer;
  geo?: FrontmatterGeo;
  heroImage?: FrontmatterHeroImage;
  internalLinks?: FrontmatterInternalLink[];
  nextStep?: FrontmatterNextStep;
}

export interface ParsedMarkdownContent {
  frontmatter: ParsedFrontmatter;
  content: string;
  raw: string;
  hash: string;
}

/**
 * Parse markdown file with YAML frontmatter
 */
export function parseMarkdownWithFrontmatter(markdownContent: string): ParsedMarkdownContent {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdownContent.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid markdown format: frontmatter not found');
  }

  const [, frontmatterYaml, content] = match;
  const frontmatter = parseYAMLFrontmatter(frontmatterYaml);
  const hash = generateContentHash(markdownContent);

  return {
    frontmatter,
    content: content.trim(),
    raw: markdownContent,
    hash,
  };
}

/**
 * Generate YAML frontmatter from structured data
 */
export function generateFrontmatter(data: ParsedFrontmatter): string {
  const yaml: string[] = ['---'];
  
  // Basic fields
  yaml.push(`title: "${escapeYaml(data.title)}"`);
  yaml.push(`slug: "${data.slug}"`);
  yaml.push(`language: "${data.language}"`);
  yaml.push(`funnelStage: "${data.funnelStage}"`);
  yaml.push(`topic: "${data.topic}"`);
  yaml.push(`summary: "${escapeYaml(data.summary)}"`);
  yaml.push('');

  // SEO section
  yaml.push('# SEO');
  yaml.push('seo:');
  yaml.push(`  metaTitle: "${escapeYaml(data.seo.metaTitle)}"`);
  yaml.push(`  metaDescription: "${escapeYaml(data.seo.metaDescription)}"`);
  if (data.seo.canonical) {
    yaml.push(`  canonical: "${data.seo.canonical}"`);
  }
  if (data.seo.hreflang && data.seo.hreflang.length > 0) {
    yaml.push('  hreflang:');
    data.seo.hreflang.forEach(link => {
      yaml.push(`    - lang: "${link.lang}"`);
      yaml.push(`      url: "${link.url}"`);
    });
  }
  yaml.push('');

  // Voice Search / AEO
  if (data.speakableQuestions && data.speakableQuestions.length > 0) {
    yaml.push('# Voice Search / AEO');
    yaml.push('speakableQuestions:');
    data.speakableQuestions.forEach(q => {
      yaml.push(`  - "${escapeYaml(q)}"`);
    });
    yaml.push('');
  }

  if (data.speakableAnswer) {
    yaml.push(`speakableAnswer: "${escapeYaml(data.speakableAnswer)}"`);
    yaml.push('');
  }

  // E-E-A-T
  if (data.author) {
    yaml.push('# E-E-A-T');
    yaml.push('author:');
    yaml.push(`  name: "${escapeYaml(data.author.name)}"`);
    if (data.author.credentials) {
      yaml.push(`  credentials: "${escapeYaml(data.author.credentials)}"`);
    }
    if (data.author.bio) {
      yaml.push(`  bio: "${escapeYaml(data.author.bio)}"`);
    }
    yaml.push('');
  }

  if (data.reviewer) {
    yaml.push('reviewer:');
    yaml.push(`  name: "${escapeYaml(data.reviewer.name)}"`);
    if (data.reviewer.credentials) {
      yaml.push(`  credentials: "${escapeYaml(data.reviewer.credentials)}"`);
    }
    if (data.reviewer.reviewDate) {
      yaml.push(`  reviewDate: "${data.reviewer.reviewDate}"`);
    }
    yaml.push('');
  }

  // GEO Signals
  if (data.geo) {
    yaml.push('# GEO Signals');
    yaml.push('geo:');
    yaml.push(`  latitude: ${data.geo.latitude}`);
    yaml.push(`  longitude: ${data.geo.longitude}`);
    yaml.push(`  address: "${escapeYaml(data.geo.address)}"`);
    yaml.push('  areaServed:');
    data.geo.areaServed.forEach(area => {
      yaml.push(`    - "${escapeYaml(area)}"`);
    });
    yaml.push('');
  }

  // Hero Image
  if (data.heroImage) {
    yaml.push('# Media');
    yaml.push('heroImage:');
    yaml.push(`  src: "${data.heroImage.src}"`);
    yaml.push(`  alt: "${escapeYaml(data.heroImage.alt)}"`);
    if (data.heroImage.caption) {
      yaml.push(`  caption: "${escapeYaml(data.heroImage.caption)}"`);
    }
    if (data.heroImage.geoCoordinates) {
      yaml.push(`  geoCoordinates: { lat: ${data.heroImage.geoCoordinates.lat}, lng: ${data.heroImage.geoCoordinates.lng} }`);
    }
    yaml.push('');
  }

  // Internal Links
  if (data.internalLinks && data.internalLinks.length > 0) {
    yaml.push('# Internal Linking');
    yaml.push('internalLinks:');
    data.internalLinks.forEach(link => {
      yaml.push(`  - slug: "${link.slug}"`);
      yaml.push(`    anchor: "${escapeYaml(link.anchor)}"`);
    });
    yaml.push('');
  }

  // Next Step
  if (data.nextStep) {
    yaml.push('# Funnel Navigation');
    yaml.push('nextStep:');
    yaml.push(`  title: "${escapeYaml(data.nextStep.title)}"`);
    yaml.push(`  slug: "${data.nextStep.slug}"`);
    yaml.push(`  cta: "${escapeYaml(data.nextStep.cta)}"`);
    yaml.push('');
  }

  yaml.push('---');
  return yaml.join('\n');
}

/**
 * Simple YAML parser for frontmatter (supports basic structures)
 */
function parseYAMLFrontmatter(yaml: string): ParsedFrontmatter {
  const lines = yaml.split('\n');
  const result: any = {};
  let currentKey: string | null = null;
  let currentObject: any = null;
  let currentArray: any[] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check for key-value pairs
    const kvMatch = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
    if (kvMatch) {
      const [, indent, key, value] = kvMatch;
      const indentLevel = indent.length;

      if (indentLevel === 0) {
        // Top-level key
        currentKey = key;
        currentObject = null;
        currentArray = null;

        if (value) {
          result[key] = parseValue(value);
        } else {
          result[key] = {};
          currentObject = result[key];
        }
      } else if (indentLevel === 2 && currentKey) {
        // Nested under top-level key
        if (value) {
          if (currentObject) {
            currentObject[key] = parseValue(value);
          }
        } else {
          if (currentObject) {
            currentObject[key] = [];
            currentArray = currentObject[key];
          }
        }
      }
    }

    // Check for array items
    const arrayMatch = line.match(/^\s*-\s+(.+)$/);
    if (arrayMatch && currentArray !== null) {
      currentArray.push(parseValue(arrayMatch[1]));
    }

    // Check for nested array objects
    const nestedArrayMatch = line.match(/^\s+-\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
    if (nestedArrayMatch && currentArray !== null) {
      const [, nestedKey, nestedValue] = nestedArrayMatch;
      const obj: any = {};
      obj[nestedKey] = parseValue(nestedValue);
      currentArray.push(obj);
    }
  }

  return result as ParsedFrontmatter;
}

/**
 * Parse YAML value (string, number, boolean, array)
 */
function parseValue(value: string): any {
  const trimmed = value.trim();
  
  // Remove quotes
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  // Boolean
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Array inline
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return JSON.parse(trimmed);
  }

  // Object inline
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed);
  }

  return trimmed;
}

/**
 * Escape YAML special characters
 */
function escapeYaml(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * Generate content hash for change detection
 */
export function generateContentHash(content: string): string {
  if (typeof window !== 'undefined') {
    // Browser environment - use simple hash
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  } else {
    // Node environment - use crypto
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  }
}

/**
 * Combine frontmatter and content into full markdown
 */
export function combineMarkdown(frontmatter: ParsedFrontmatter, content: string): string {
  const yamlFrontmatter = generateFrontmatter(frontmatter);
  return `${yamlFrontmatter}\n\n${content}`;
}
