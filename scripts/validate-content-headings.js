import fs from 'fs';
import { glob } from 'glob';

function validateContentHeadings() {
  const files = glob.sync('content/**/*.md');
  const errors = [];
  const warnings = [];

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Remove frontmatter
    const bodyContent = content.replace(/^---[\s\S]+?---\n/, '');
    
    // Extract all headings
    const headings = bodyContent.match(/^#{1,6} .+$/gm) || [];
    
    if (headings.length === 0) {
      warnings.push(`${file}: No headings found in content`);
      return;
    }

    // Count H1s
    const h1s = headings.filter(h => h.startsWith('# '));
    const h1Count = h1s.length;
    
    if (h1Count === 0) {
      errors.push(`${file}: No H1 heading found (required for SEO)`);
    } else if (h1Count > 1) {
      errors.push(`${file}: Multiple H1 headings found (${h1Count}) - only one H1 allowed per page`);
      h1s.forEach((h1, idx) => {
        errors.push(`  H1 #${idx + 1}: ${h1}`);
      });
    }

    // Check heading hierarchy
    let prevLevel = 0;
    const hierarchyErrors = [];
    
    headings.forEach((heading, idx) => {
      const level = heading.match(/^#+/)[0].length;
      
      // Check for skipped levels (e.g., H2 -> H4)
      if (level > prevLevel + 1 && prevLevel !== 0) {
        hierarchyErrors.push(
          `  Line ~${idx + 1}: Skipped heading level (H${prevLevel} -> H${level}): ${heading.substring(0, 60)}${heading.length > 60 ? '...' : ''}`
        );
      }
      
      prevLevel = level;
    });

    if (hierarchyErrors.length > 0) {
      errors.push(`${file}: Invalid heading hierarchy detected:`);
      hierarchyErrors.forEach(err => errors.push(err));
    }

    // Check for empty headings
    const emptyHeadings = [];
    headings.forEach((heading, idx) => {
      const text = heading.replace(/^#+\s*/, '').trim();
      if (text.length === 0) {
        emptyHeadings.push(`  Line ~${idx + 1}: Empty heading found: ${heading}`);
      }
    });

    if (emptyHeadings.length > 0) {
      errors.push(`${file}: Empty headings found:`);
      emptyHeadings.forEach(err => errors.push(err));
    }

    // Check for very short headings (potential quality issue)
    const shortHeadings = [];
    headings.forEach((heading, idx) => {
      const text = heading.replace(/^#+\s*/, '').trim();
      if (text.length > 0 && text.length < 3) {
        shortHeadings.push(`  Line ~${idx + 1}: Very short heading (${text.length} chars): ${heading}`);
      }
    });

    if (shortHeadings.length > 0) {
      warnings.push(`${file}: Unusually short headings found:`);
      shortHeadings.forEach(warn => warnings.push(warn));
    }

    // Check for very long headings (potential UX issue)
    const longHeadings = [];
    headings.forEach((heading, idx) => {
      const text = heading.replace(/^#+\s*/, '').trim();
      if (text.length > 100) {
        longHeadings.push(`  Line ~${idx + 1}: Very long heading (${text.length} chars): ${text.substring(0, 60)}...`);
      }
    });

    if (longHeadings.length > 0) {
      warnings.push(`${file}: Unusually long headings found (consider breaking into shorter sections):`);
      longHeadings.forEach(warn => warnings.push(warn));
    }
  });

  // Print results
  console.log('\n=== CONTENT HEADING VALIDATION RESULTS ===\n');
  
  if (errors.length > 0) {
    console.error('❌ ERRORS (must fix):');
    errors.forEach(err => console.error(`  ${err}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  WARNINGS (should fix):');
    warnings.forEach(warn => console.warn(`  ${warn}`));
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All content headings valid!');
  }

  console.log(`Checked ${files.length} files`);
  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}\n`);

  // Exit with error code if validation fails
  if (errors.length > 0) {
    process.exit(1);
  }
}

validateContentHeadings();
