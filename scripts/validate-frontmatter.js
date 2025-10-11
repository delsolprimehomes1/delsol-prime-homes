import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_LANGUAGES = ['en', 'es', 'de', 'fr', 'nl', 'sv', 'da', 'pl', 'hu'];
const VALID_FUNNEL_STAGES = ['TOFU', 'MOFU', 'BOFU'];

const errors = [];
const warnings = [];

function validateFrontmatter(filePath, content) {
  const fileName = path.relative(process.cwd(), filePath);
  
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

  if (!frontmatter.language || !VALID_LANGUAGES.includes(frontmatter.language)) {
    errors.push(`${fileName}: Invalid language code`);
  }

  if (frontmatter.stage && !VALID_FUNNEL_STAGES.includes(frontmatter.stage)) {
    errors.push(`${fileName}: Invalid funnel stage`);
  }

  if (frontmatter.canonical_url && !frontmatter.canonical_url.startsWith('https://www.datocms.com')) {
    errors.push(`${fileName}: Invalid canonical URL`);
  }

  if (typeof frontmatter.is_external !== 'boolean') {
    warnings.push(`${fileName}: is_external should be a boolean`);
  }
  
  if (!frontmatter.title || frontmatter.title.length < 10 || frontmatter.title.length > 100) {
    errors.push(`${fileName}: Title must be 10-100 characters`);
  }

  if (!frontmatter.slug || !/^[a-z0-9-]+$/.test(frontmatter.slug)) {
    errors.push(`${fileName}: Invalid slug format`);
  }
}

async function validateAllFiles() {
  console.log('🔍 Validating frontmatter...\n');

  const files = await glob('content/**/*.md', { cwd: process.cwd() });
  
  // CRITICAL: Fail if no content files found
  if (files.length === 0) {
    console.error('\n❌ FATAL ERROR: No markdown files found in content/ directory!');
    console.error('📁 Expected structure: content/{lang}/{type}/{slug}/index.md');
    console.error('🔧 To fix: npm run export:content\n');
    process.exit(1);
  }
  
  console.log(`✅ Found ${files.length} markdown files to validate\n`);

  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    validateFrontmatter(fullPath, content);
  }

  console.log('\n=== VALIDATION RESULTS ===\n');
  
  if (errors.length > 0) {
    console.error('❌ ERRORS:', errors.length);
    errors.forEach(err => console.error(`  ${err}`));
    process.exit(1);
  }

  console.log('✅ All valid!\n');
  process.exit(0);
}

validateAllFiles().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
