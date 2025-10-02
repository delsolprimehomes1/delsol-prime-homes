import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let hasErrors = false;
const errors = [];
const warnings = [];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

function checkImageReferences(filePath, content) {
  const fileName = path.relative(process.cwd(), filePath);
  
  // Check for image imports
  const importMatches = content.matchAll(/import\s+.*?from\s+['"](.+?\.(jpg|jpeg|png|webp|gif|svg))['"]/gi);
  for (const match of importMatches) {
    const imagePath = match[1];
    const resolvedPath = path.resolve(path.dirname(filePath), imagePath);
    
    if (!fs.existsSync(resolvedPath)) {
      errors.push(`${fileName}: Referenced image not found: ${imagePath}`);
    }
  }

  // Check for img src attributes
  const imgMatches = content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  for (const match of imgMatches) {
    const fullMatch = match[0];
    const src = match[1];
    
    // Check if it's a local path (not http/https/data)
    if (!src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('/')) {
      const imagePath = path.resolve(path.dirname(filePath), src);
      if (!fs.existsSync(imagePath)) {
        errors.push(`${fileName}: Image file not found: ${src}`);
      }
    }

    // Check for alt text
    if (!fullMatch.includes('alt=')) {
      errors.push(`${fileName}: Image missing alt attribute: ${src}`);
    } else {
      const altMatch = fullMatch.match(/alt=["']([^"']*)["']/);
      if (altMatch && !altMatch[1].trim()) {
        errors.push(`${fileName}: Image has empty alt attribute: ${src}`);
      }
    }
  }

  // Check markdown images
  const mdImageMatches = content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g);
  for (const match of mdImageMatches) {
    const altText = match[1];
    const imagePath = match[2];
    
    if (!altText.trim()) {
      warnings.push(`${fileName}: Markdown image missing alt text: ${imagePath}`);
    }

    if (!imagePath.startsWith('http') && !imagePath.startsWith('/')) {
      const resolvedPath = path.resolve(path.dirname(filePath), imagePath);
      if (!fs.existsSync(resolvedPath)) {
        errors.push(`${fileName}: Markdown image file not found: ${imagePath}`);
      }
    }
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
      if (['.tsx', '.jsx', '.md', '.mdx'].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        checkImageReferences(fullPath, content);
      }
    }
  }
}

function checkPublicImages() {
  const publicDir = path.join(__dirname, '../public/assets');
  if (!fs.existsSync(publicDir)) {
    warnings.push('Public assets directory not found');
    return;
  }

  function scanImages(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanImages(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          // Check file size (warn if > 500KB)
          const stats = fs.statSync(fullPath);
          const sizeMB = stats.size / (1024 * 1024);
          if (sizeMB > 0.5) {
            warnings.push(`Image is large (${sizeMB.toFixed(2)}MB): ${path.relative(process.cwd(), fullPath)}`);
          }
        }
      }
    }
  }

  scanImages(publicDir);
}

console.log('🔍 Validating images...\n');

// Check src directory for image references
const srcDir = path.join(__dirname, '../src');
if (fs.existsSync(srcDir)) {
  scanDirectory(srcDir);
}

// Check content directory
const contentDir = path.join(__dirname, '../content');
if (fs.existsSync(contentDir)) {
  scanDirectory(contentDir);
}

// Check public images
checkPublicImages();

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
  console.log(`✅ All images validated successfully (${warnings.length} warning(s))`);
  process.exit(0);
}
