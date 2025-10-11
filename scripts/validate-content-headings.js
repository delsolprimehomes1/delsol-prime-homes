import fs from 'fs';
import { glob } from 'glob';

function validateContentHeadings() {
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
    const bodyContent = content.replace(/^---[\s\S]+?---\n/, '');
    const headings = bodyContent.match(/^#{1,6} .+$/gm) || [];
    
    const h1s = headings.filter(h => h.startsWith('# '));
    
    if (h1s.length === 0) {
      errors.push(`${file}: No H1 heading found`);
    } else if (h1s.length > 1) {
      errors.push(`${file}: Multiple H1 headings (${h1s.length})`);
    }
  });

  console.log('\n=== HEADING VALIDATION ===\n');
  
  if (errors.length > 0) {
    console.error(`❌ Errors: ${errors.length}`);
    errors.forEach(err => console.error(`  ${err}`));
    process.exit(1);
  }

  console.log('✅ All valid!\n');
}

validateContentHeadings();
