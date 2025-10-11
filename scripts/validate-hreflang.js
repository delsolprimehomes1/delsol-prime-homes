#!/usr/bin/env node

/**
 * Validate hreflang links in markdown frontmatter
 */

const glob = require('glob');
const fs = require('fs');
const path = require('path');

const files = glob.sync('content/**/*.md', { ignore: 'content/samples/**' });

// CRITICAL: Fail if no content files found
if (files.length === 0) {
  console.error('❌ FATAL ERROR: No markdown files found in content/ directory!');
  console.error('📁 Expected structure: content/{lang}/{type}/{slug}/index.md');
  console.error('🔧 To fix: npm run export:content');
  process.exit(1);
}

console.log(`✅ Found ${files.length} markdown files to validate\n`);

const REQUIRED_LANGUAGES = ['en', 'es', 'de', 'nl', 'fr', 'pl', 'sv', 'da', 'hu', 'no', 'fi'];
const errors = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    errors.push(`${file}: No frontmatter found`);
    return;
  }
  
  const frontmatter = frontmatterMatch[1];
  
  // Check for hreflang section
  if (!frontmatter.includes('hreflang:')) {
    errors.push(`${file}: Missing hreflang section`);
    return;
  }
  
  // Check each required language
  REQUIRED_LANGUAGES.forEach(lang => {
    if (!frontmatter.includes(`lang: ${lang}`)) {
      errors.push(`${file}: Missing hreflang for ${lang}`);
    }
  });
  
  // Check for x-default
  if (!frontmatter.includes('x-default')) {
    errors.push(`${file}: Missing x-default hreflang`);
  }
});

// Report results
if (errors.length > 0) {
  console.error(`\n❌ Found ${errors.length} hreflang errors:\n`);
  errors.slice(0, 20).forEach(err => console.error(`  ${err}`));
  if (errors.length > 20) {
    console.error(`  ... and ${errors.length - 20} more`);
  }
  process.exit(1);
} else {
  console.log('✅ All hreflang links valid!\n');
  process.exit(0);
}
