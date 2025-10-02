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

  // 1. CORE FIELDS VALIDATION
  if (!frontmatter.title || frontmatter.title.length < 10 || frontmatter.title.length > 100) {
    errors.push(`${fileName}: Title must be 10-100 characters`);
  }

  if (!frontmatter.slug || !/^[a-z0-9-]+$/.test(frontmatter.slug)) {
    errors.push(`${fileName}: Invalid slug format (use lowercase, numbers, and hyphens only)`);
  }

  if (!frontmatter.language || !VALID_LANGUAGES.includes(frontmatter.language)) {
    errors.push(`${fileName}: Invalid language code (must be one of: ${VALID_LANGUAGES.join(', ')})`);
  }

  if (!frontmatter.funnelStage || !VALID_FUNNEL_STAGES.includes(frontmatter.funnelStage)) {
    errors.push(`${fileName}: Invalid funnelStage (must be TOFU, MOFU, or BOFU)`);
  }

  if (!frontmatter.topic) {
    errors.push(`${fileName}: Missing required field 'topic'`);
  }

  if (!frontmatter.summary || frontmatter.summary.length < 100 || frontmatter.summary.length > 300) {
    warnings.push(`${fileName}: Summary should be 100-300 characters (found ${frontmatter.summary?.length || 0})`);
  }

  // 2. SEO OBJECT VALIDATION
  if (!frontmatter.seo) {
    errors.push(`${fileName}: Missing required 'seo' object`);
  } else {
    const metaTitleLen = frontmatter.seo.metaTitle?.length || 0;
    if (metaTitleLen < 50 || metaTitleLen > 60) {
      warnings.push(`${fileName}: Meta title should be 50-60 characters (found ${metaTitleLen})`);
    }

    const metaDescLen = frontmatter.seo.metaDescription?.length || 0;
    if (metaDescLen < 150 || metaDescLen > 160) {
      warnings.push(`${fileName}: Meta description should be 150-160 characters (found ${metaDescLen})`);
    }

    if (!frontmatter.seo.canonical || !frontmatter.seo.canonical.startsWith('https://delsolprimehomes.com')) {
      errors.push(`${fileName}: Invalid canonical URL (must start with https://delsolprimehomes.com)`);
    }

    if (!frontmatter.seo.hreflang || !Array.isArray(frontmatter.seo.hreflang) || frontmatter.seo.hreflang.length === 0) {
      errors.push(`${fileName}: Missing or invalid hreflang tags`);
    } else {
      frontmatter.seo.hreflang.forEach((link, index) => {
        if (!link.lang || !link.url) {
          errors.push(`${fileName}: hreflang[${index}] missing 'lang' or 'url'`);
        }
        if (link.url && !link.url.startsWith('https://')) {
          errors.push(`${fileName}: hreflang[${index}] URL must be HTTPS`);
        }
      });
    }
  }

  // 3. SPEAKABLE CONTENT VALIDATION (CRITICAL)
  if (!frontmatter.speakableQuestions || !Array.isArray(frontmatter.speakableQuestions) || frontmatter.speakableQuestions.length < 3 || frontmatter.speakableQuestions.length > 5) {
    errors.push(`${fileName}: Must have 3-5 speakable questions`);
  }

  if (!frontmatter.speakableAnswer) {
    errors.push(`${fileName}: Missing speakable answer`);
  } else {
    const speakableWords = frontmatter.speakableAnswer.split(/\s+/).filter(w => w.length > 0).length;
    if (speakableWords < 40 || speakableWords > 60) {
      errors.push(`${fileName}: Speakable answer MUST be 40-60 words (found ${speakableWords})`);
    }
  }

  // 4. E-E-A-T VALIDATION
  if (!frontmatter.author) {
    errors.push(`${fileName}: Missing required 'author' object`);
  } else {
    if (!frontmatter.author.name) {
      errors.push(`${fileName}: Missing author name`);
    }
    if (!frontmatter.author.credentials || frontmatter.author.credentials.length < 10) {
      errors.push(`${fileName}: Author credentials must be at least 10 characters`);
    }
    if (!frontmatter.author.bio || frontmatter.author.bio.length < 50 || frontmatter.author.bio.length > 200) {
      warnings.push(`${fileName}: Author bio should be 50-200 characters (found ${frontmatter.author.bio?.length || 0})`);
    }
  }

  if (frontmatter.reviewer) {
    if (frontmatter.reviewer.reviewDate && !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.reviewer.reviewDate)) {
      errors.push(`${fileName}: Reviewer date must be in ISO 8601 format (YYYY-MM-DD)`);
    }
  }

  // 5. GEO SIGNALS VALIDATION
  if (!frontmatter.geo) {
    errors.push(`${fileName}: Missing required 'geo' object`);
  } else {
    const lat = frontmatter.geo.latitude;
    const lng = frontmatter.geo.longitude;

    if (typeof lat !== 'number' || lat < 36.0 || lat > 37.0) {
      warnings.push(`${fileName}: Latitude outside Costa del Sol range (36.0-37.0)`);
    }

    if (typeof lng !== 'number' || lng < -5.5 || lng > -4.0) {
      warnings.push(`${fileName}: Longitude outside Costa del Sol range (-5.5 to -4.0)`);
    }

    if (!frontmatter.geo.address) {
      warnings.push(`${fileName}: Missing geo address`);
    }

    if (!frontmatter.geo.areaServed || !Array.isArray(frontmatter.geo.areaServed) || frontmatter.geo.areaServed.length === 0) {
      errors.push(`${fileName}: Must have at least one area served in geo`);
    }
  }

  // 6. HERO IMAGE VALIDATION
  if (!frontmatter.heroImage) {
    errors.push(`${fileName}: Missing required 'heroImage' object`);
  } else {
    if (!frontmatter.heroImage.src) {
      errors.push(`${fileName}: Missing hero image src`);
    } else if (!frontmatter.heroImage.src.startsWith('/images/') && !frontmatter.heroImage.src.startsWith('/assets/')) {
      warnings.push(`${fileName}: Hero image should be in /images/ or /assets/ directory`);
    }

    if (!frontmatter.heroImage.alt || frontmatter.heroImage.alt.length < 20 || frontmatter.heroImage.alt.length > 125) {
      errors.push(`${fileName}: Hero image alt text must be 20-125 characters`);
    }

    if (frontmatter.heroImage.alt && /\b(image of|picture of|photo of)\b/i.test(frontmatter.heroImage.alt)) {
      warnings.push(`${fileName}: Avoid generic alt text phrases like "image of", "picture of", "photo of"`);
    }

    if (frontmatter.heroImage.geoCoordinates) {
      if (!frontmatter.heroImage.geoCoordinates.lat || !frontmatter.heroImage.geoCoordinates.lng) {
        warnings.push(`${fileName}: Hero image geo coordinates incomplete`);
      }
    }
  }

  // 7. INTERNAL LINKS VALIDATION
  if (!frontmatter.internalLinks || !Array.isArray(frontmatter.internalLinks)) {
    warnings.push(`${fileName}: Missing internal links array`);
  } else if (frontmatter.internalLinks.length < 2) {
    warnings.push(`${fileName}: Should have at least 2 internal links`);
  } else {
    frontmatter.internalLinks.forEach((link, index) => {
      if (!link.slug) {
        errors.push(`${fileName}: internalLinks[${index}] missing slug`);
      }
      if (!link.anchor) {
        errors.push(`${fileName}: internalLinks[${index}] missing anchor text`);
      } else {
        const anchorWords = link.anchor.split(/\s+/).filter(w => w.length > 0).length;
        if (anchorWords < 3 || anchorWords > 10) {
          warnings.push(`${fileName}: internalLinks[${index}] anchor text should be 3-10 words (found ${anchorWords})`);
        }
      }
    });
  }

  // 8. NEXT STEP (FUNNEL) VALIDATION
  if (!frontmatter.nextStep) {
    warnings.push(`${fileName}: Missing nextStep funnel navigation`);
  } else {
    if (!frontmatter.nextStep.title) {
      warnings.push(`${fileName}: Next step missing title`);
    }
    if (!frontmatter.nextStep.slug) {
      errors.push(`${fileName}: Next step missing slug`);
    }
    if (!frontmatter.nextStep.cta) {
      warnings.push(`${fileName}: Next step missing CTA text`);
    }
  }
}

async function validateAllFiles() {
  console.log('🔍 Validating frontmatter for DelSolPrimeHomes content...\n');

  const contentDir = path.join(__dirname, '../content');
  
  if (!fs.existsSync(contentDir)) {
    console.log('⚠️  No content directory found at:', contentDir);
    console.log('✅ Validation passed (no content to validate)\n');
    process.exit(0);
  }

  const files = await glob('content/**/*.md', { cwd: process.cwd() });
  
  if (files.length === 0) {
    console.log('⚠️  No markdown files found in content directory');
    console.log('✅ Validation passed (no files to validate)\n');
    process.exit(0);
  }

  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    validateFrontmatter(fullPath, content);
  }

  // Report results
  console.log('\n=== FRONTMATTER VALIDATION RESULTS ===\n');
  
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
    console.log('✅ All frontmatter is valid!');
  }

  console.log(`\nChecked ${files.length} file(s)`);
  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}\n`);

  // Exit with error code if validation fails
  if (errors.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

validateAllFiles().catch(error => {
  console.error('Fatal error during validation:', error);
  process.exit(1);
});
