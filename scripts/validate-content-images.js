import fs from 'fs';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';

function validateContentImages() {
  const files = glob.sync('content/**/*.md');
  
  // CRITICAL: Fail if no content files found
  if (files.length === 0) {
    console.error('\n❌ FATAL ERROR: No markdown files found in content/ directory!');
    console.error('📁 Expected structure: content/{lang}/{type}/{slug}/index.md');
    console.error('🔧 To fix: npm run export:content\n');
    process.exit(1);
  }
  
  console.log(`\n✅ Found ${files.length} files to validate\n`);
  
  const errors = [];

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^---\n([\s\S]+?)\n---/);
    
    if (!match) return;

    let frontmatter;
    try {
      frontmatter = parseYaml(match[1]);
    } catch (e) {
      errors.push(`${file}: Invalid YAML`);
      return;
    }

    if (!frontmatter.heroImage?.alt) {
      errors.push(`${file}: Missing hero image alt text`);
    }
  });

  console.log('\n=== IMAGE VALIDATION ===\n');
  
  if (errors.length > 0) {
    console.error(`❌ Errors: ${errors.length}`);
    errors.forEach(err => console.error(`  ${err}`));
    process.exit(1);
  }

  console.log('✅ All valid!\n');
}

validateContentImages();
