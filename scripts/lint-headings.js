import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errors = [];
const warnings = [];

function extractHeadings(content, isMarkdown = false) {
  const headings = [];

  if (isMarkdown) {
    // Extract markdown headings
    const mdHeadingMatches = content.matchAll(/^(#{1,6})\s+(.+)$/gm);
    for (const match of mdHeadingMatches) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({ level, text, line: match.index });
    }
  } else {
    // Extract JSX/HTML headings
    const htmlHeadingMatches = content.matchAll(/<(h[1-6])[^>]*>([^<]+)<\/\1>/gi);
    for (const match of htmlHeadingMatches) {
      const level = parseInt(match[1].substring(1));
      const text = match[2].trim();
      headings.push({ level, text, line: match.index });
    }
  }

  return headings;
}

function validateHeadings(filePath, content, isMarkdown = false) {
  const fileName = path.relative(process.cwd(), filePath);
  const headings = extractHeadings(content, isMarkdown);

  if (headings.length === 0) {
    warnings.push(`${fileName}: No headings found`);
    return;
  }

  // Check for multiple H1s
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count > 1) {
    errors.push(`${fileName}: Multiple H1 tags found (${h1Count}). Should have only one.`);
  } else if (h1Count === 0) {
    warnings.push(`${fileName}: No H1 tag found`);
  }

  // Check for empty headings
  headings.forEach((heading, index) => {
    if (!heading.text || heading.text.trim() === '') {
      errors.push(`${fileName}: Empty heading at position ${index + 1}`);
    }
  });

  // Check heading hierarchy (no skipped levels)
  for (let i = 1; i < headings.length; i++) {
    const prevLevel = headings[i - 1].level;
    const currLevel = headings[i].level;
    
    if (currLevel > prevLevel + 1) {
      errors.push(
        `${fileName}: Skipped heading level from H${prevLevel} to H${currLevel} ` +
        `(heading: "${headings[i].text.substring(0, 50)}...")`
      );
    }
  }

  // Check for very long headings
  headings.forEach((heading) => {
    if (heading.text.length > 120) {
      warnings.push(
        `${fileName}: Heading is too long (${heading.text.length} chars): ` +
        `"${heading.text.substring(0, 60)}..."`
      );
    }
  });

  // Check for duplicate headings
  const headingTexts = headings.map(h => h.text.toLowerCase());
  const duplicates = headingTexts.filter((text, index) => 
    headingTexts.indexOf(text) !== index
  );
  
  if (duplicates.length > 0) {
    warnings.push(
      `${fileName}: Duplicate headings found: ${[...new Set(duplicates)].join(', ')}`
    );
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const isMarkdown = ['.md', '.mdx'].includes(ext);
      const isComponent = ['.tsx', '.jsx'].includes(ext);
      
      if (isMarkdown || isComponent) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        validateHeadings(fullPath, content, isMarkdown);
      }
    }
  }
}

console.log('🔍 Linting heading structure...\n');

// Check src directory
const srcDir = path.join(__dirname, '../src');
if (fs.existsSync(srcDir)) {
  scanDirectory(srcDir);
}

// Check content directory
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
  console.log(`✅ All heading structures are valid (${warnings.length} warning(s))`);
  process.exit(0);
}
