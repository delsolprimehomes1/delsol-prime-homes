import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let hasErrors = false;
const errors = [];
const warnings = [];

const REQUIRED_SCHEMA_TYPES = {
  blog: ['BlogPosting', 'BreadcrumbList'],
  qa: ['FAQPage', 'BreadcrumbList']
};

function validateJsonLD(filePath, content) {
  const fileName = path.relative(process.cwd(), filePath);
  
  // Extract all JSON-LD script tags
  const jsonLdMatches = content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  const schemas = [];
  
  for (const match of jsonLdMatches) {
    try {
      const schema = JSON.parse(match[1]);
      schemas.push(schema);
    } catch (error) {
      errors.push(`${fileName}: Invalid JSON-LD syntax - ${error.message}`);
      continue;
    }
  }

  if (schemas.length === 0) {
    warnings.push(`${fileName}: No JSON-LD schema found`);
    return;
  }

  // Validate each schema
  schemas.forEach((schema, index) => {
    // Check @context
    if (!schema['@context'] || !schema['@context'].includes('schema.org')) {
      errors.push(`${fileName}: Schema ${index} missing valid @context`);
    }

    // Check @type
    if (!schema['@type']) {
      errors.push(`${fileName}: Schema ${index} missing @type`);
    }

    // Type-specific validation
    if (schema['@type'] === 'BlogPosting') {
      const requiredFields = ['headline', 'author', 'datePublished', 'image'];
      requiredFields.forEach(field => {
        if (!schema[field]) {
          errors.push(`${fileName}: BlogPosting schema missing required field '${field}'`);
        }
      });

      // Validate author structure
      if (schema.author && !schema.author['@type']) {
        errors.push(`${fileName}: BlogPosting author missing @type`);
      }

      // Validate image format
      if (schema.image && typeof schema.image === 'string') {
        if (!schema.image.startsWith('http')) {
          errors.push(`${fileName}: BlogPosting image must be absolute URL`);
        }
      }
    }

    if (schema['@type'] === 'FAQPage') {
      if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
        errors.push(`${fileName}: FAQPage must have mainEntity array`);
      } else {
        schema.mainEntity.forEach((question, qIndex) => {
          if (question['@type'] !== 'Question') {
            errors.push(`${fileName}: FAQPage mainEntity[${qIndex}] must be of type Question`);
          }
          if (!question.name) {
            errors.push(`${fileName}: FAQPage Question[${qIndex}] missing name`);
          }
          if (!question.acceptedAnswer) {
            errors.push(`${fileName}: FAQPage Question[${qIndex}] missing acceptedAnswer`);
          }
        });
      }
    }

    if (schema['@type'] === 'BreadcrumbList') {
      if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
        errors.push(`${fileName}: BreadcrumbList must have itemListElement array`);
      } else {
        schema.itemListElement.forEach((item, itemIndex) => {
          if (!item.position || !item.name || !item.item) {
            errors.push(`${fileName}: BreadcrumbList item[${itemIndex}] missing required fields`);
          }
        });
      }
    }

    // Validate URLs are absolute
    ['url', 'sameAs', 'mainEntityOfPage'].forEach(urlField => {
      if (schema[urlField] && typeof schema[urlField] === 'string') {
        if (!schema[urlField].startsWith('http')) {
          warnings.push(`${fileName}: ${urlField} should be absolute URL`);
        }
      }
    });
  });
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Only validate files that have JSON-LD
      if (content.includes('application/ld+json')) {
        validateJsonLD(fullPath, content);
      }
    }
  }
}

console.log('🔍 Validating JSON-LD schemas...\n');

const srcDir = path.join(__dirname, '../src');
if (fs.existsSync(srcDir)) {
  scanDirectory(srcDir);
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
  console.log(`✅ All JSON-LD schemas are valid (${warnings.length} warning(s))`);
  process.exit(0);
}
