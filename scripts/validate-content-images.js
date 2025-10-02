import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import { glob } from 'glob';

function validateContentImages() {
  const files = glob.sync('content/**/*.md');
  const errors = [];
  const warnings = [];

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^---\n([\s\S]+?)\n---/);
    
    if (!match) {
      warnings.push(`${file}: No frontmatter found`);
      return;
    }

    let frontmatter;
    try {
      frontmatter = parseYaml(match[1]);
    } catch (e) {
      errors.push(`${file}: Invalid YAML syntax - ${e.message}`);
      return;
    }

    const heroImage = frontmatter.heroImage;

    if (!heroImage) {
      warnings.push(`${file}: No heroImage defined`);
      return;
    }

    // Check if image file exists
    if (heroImage.src) {
      const imagePath = path.join('public', heroImage.src);
      if (!fs.existsSync(imagePath)) {
        errors.push(`${file}: Hero image file not found: ${heroImage.src}`);
      }

      // Check image path format
      if (!heroImage.src.startsWith('/images/') && !heroImage.src.startsWith('/assets/')) {
        warnings.push(`${file}: Hero image should be in /images/ or /assets/ directory`);
      }
    } else {
      errors.push(`${file}: Hero image src is missing`);
    }

    // Check alt text quality
    if (!heroImage.alt) {
      errors.push(`${file}: Missing alt text for hero image`);
    } else {
      if (heroImage.alt.length < 20) {
        errors.push(`${file}: Alt text too short (min 20 chars, found ${heroImage.alt.length})`);
      }
      if (heroImage.alt.length > 125) {
        errors.push(`${file}: Alt text too long (max 125 chars, found ${heroImage.alt.length})`);
      }
      
      // Check for generic phrases
      const genericPhrases = ['image of', 'picture of', 'photo of', 'image showing'];
      const lowerAlt = heroImage.alt.toLowerCase();
      const foundGeneric = genericPhrases.find(phrase => lowerAlt.includes(phrase));
      
      if (foundGeneric) {
        warnings.push(`${file}: Avoid generic alt text phrase: "${foundGeneric}"`);
      }
    }

    // Validate geo coordinates match article location
    if (heroImage.geoCoordinates && frontmatter.geo) {
      const imageLat = heroImage.geoCoordinates.lat;
      const imageLng = heroImage.geoCoordinates.lng;
      const articleLat = frontmatter.geo.latitude;
      const articleLng = frontmatter.geo.longitude;
      
      if (imageLat && articleLat) {
        if (Math.abs(imageLat - articleLat) > 0.5) {
          warnings.push(`${file}: Image latitude (${imageLat}) differs significantly from article location (${articleLat})`);
        }
      }
      
      if (imageLng && articleLng) {
        if (Math.abs(imageLng - articleLng) > 0.5) {
          warnings.push(`${file}: Image longitude (${imageLng}) differs significantly from article location (${articleLng})`);
        }
      }
    } else if (heroImage.geoCoordinates && !frontmatter.geo) {
      warnings.push(`${file}: Hero image has geo coordinates but article has no geo data`);
    }

    // Check if geoCoordinates are complete
    if (heroImage.geoCoordinates) {
      if (!heroImage.geoCoordinates.lat || !heroImage.geoCoordinates.lng) {
        errors.push(`${file}: Hero image geoCoordinates incomplete (need both lat and lng)`);
      }
    }
  });

  // Print results
  console.log('\n=== CONTENT IMAGE VALIDATION RESULTS ===\n');
  
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
    console.log('✅ All content images valid!');
  }

  console.log(`Checked ${files.length} files`);
  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}\n`);

  // Exit with error code if validation fails
  if (errors.length > 0) {
    process.exit(1);
  }
}

validateContentImages();
