import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_FIELDS = [
  'title',
  'description',
  'slug',
  'language',
  'published',
  'date'
];

const VALID_LANGUAGES = ['en', 'es', 'de', 'fr', 'nl', 'sv', 'da', 'pl', 'hu'];

let hasErrors = false;
const errors = [];
const warnings = [];

function validateFrontmatter(filePath, content) {
  const fileName = path.relative(process.cwd(), filePath);
  
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    errors.push(`${fileName}: No frontmatter found`);
    return;
  }

  let frontmatter;
  try {
    frontmatter = yaml.parse(frontmatterMatch[1]);
  } catch (error) {
    errors.push(`${fileName}: Invalid YAML syntax - ${error.message}`);
    return;
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      errors.push(`${fileName}: Missing required field '${field}'`);
    }
  }

  // Validate language
  if (frontmatter.language && !VALID_LANGUAGES.includes(frontmatter.language)) {
    errors.push(`${fileName}: Invalid language '${frontmatter.language}'`);
  }

  // Validate slug format
  if (frontmatter.slug && !/^[a-z0-9-]+$/.test(frontmatter.slug)) {
    errors.push(`${fileName}: Invalid slug format '${frontmatter.slug}' (use lowercase, numbers, hyphens only)`);
  }

  // Validate hreflang if present
  if (frontmatter.hreflang) {
    if (!Array.isArray(frontmatter.hreflang)) {
      errors.push(`${fileName}: hreflang must be an array`);
    } else {
      frontmatter.hreflang.forEach((link, index) => {
        if (!link.lang || !link.url) {
          errors.push(`${fileName}: hreflang[${index}] missing 'lang' or 'url'`);
        }
        if (link.lang && !VALID_LANGUAGES.includes(link.lang)) {
          warnings.push(`${fileName}: hreflang[${index}] has invalid language '${link.lang}'`);
        }
      });
    }
  }

  // Validate published status
  if (typeof frontmatter.published !== 'boolean') {
    errors.push(`${fileName}: 'published' must be a boolean`);
  }

  // Validate date format
  if (frontmatter.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(frontmatter.date)) {
      errors.push(`${fileName}: Invalid date format '${frontmatter.date}' (use YYYY-MM-DD)`);
    }
  }

  // Check for funnel stage if present
  if (frontmatter.funnelStage && !['TOFU', 'MOFU', 'BOFU'].includes(frontmatter.funnelStage)) {
    warnings.push(`${fileName}: Invalid funnelStage '${frontmatter.funnelStage}' (should be TOFU, MOFU, or BOFU)`);
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      validateFrontmatter(fullPath, content);
    }
  }
}

console.log('🔍 Validating frontmatter...\n');

const contentDir = path.join(__dirname, '../content');
if (fs.existsSync(contentDir)) {
  scanDirectory(contentDir);
}

// Report results
if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(warning => console.log(`  ${warning}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  errors.forEach(error => console.log(`  ${error}`));
  console.log('');
  console.log(`Found ${errors.length} error(s) and ${warnings.length} warning(s)`);
  process.exit(1);
} else {
  console.log(`✅ All frontmatter is valid (${warnings.length} warning(s))`);
  process.exit(0);
}
