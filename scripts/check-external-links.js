import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errors = [];
const warnings = [];
const checkedUrls = new Map();

// Authority domains that should be used for external links
const AUTHORITY_DOMAINS = [
  'propertyregistry.es',
  'minhap.gob.es',
  'registradores.org',
  'interior.gob.es',
  'agenciatributaria.es',
  'investinspain.org'
];

function extractExternalLinks(content) {
  const links = new Set();
  
  // Extract from href attributes
  const hrefMatches = content.matchAll(/href=["']([^"']+)["']/g);
  for (const match of hrefMatches) {
    const url = match[1];
    if (url.startsWith('http://') || url.startsWith('https://')) {
      links.add(url);
    }
  }

  // Extract from markdown links
  const mdMatches = content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const match of mdMatches) {
    const url = match[2];
    if (url.startsWith('http://') || url.startsWith('https://')) {
      links.add(url);
    }
  }

  return Array.from(links);
}

async function checkUrl(url) {
  // Return cached result if available
  if (checkedUrls.has(url)) {
    return checkedUrls.get(url);
  }

  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const request = protocol.get(url, { timeout: 5000 }, (response) => {
        const statusCode = response.statusCode;
        const result = {
          status: statusCode,
          ok: statusCode >= 200 && statusCode < 400,
          redirected: statusCode >= 300 && statusCode < 400
        };
        
        checkedUrls.set(url, result);
        resolve(result);
      });

      request.on('error', (error) => {
        const result = {
          status: 0,
          ok: false,
          error: error.message
        };
        checkedUrls.set(url, result);
        resolve(result);
      });

      request.on('timeout', () => {
        request.destroy();
        const result = {
          status: 0,
          ok: false,
          error: 'Timeout'
        };
        checkedUrls.set(url, result);
        resolve(result);
      });
    } catch (error) {
      const result = {
        status: 0,
        ok: false,
        error: error.message
      };
      checkedUrls.set(url, result);
      resolve(result);
    }
  });
}

async function validateLinks(filePath, content) {
  const fileName = path.relative(process.cwd(), filePath);
  const links = extractExternalLinks(content);

  for (const url of links) {
    try {
      const urlObj = new URL(url);
      
      // Check for HTTP (should be HTTPS)
      if (urlObj.protocol === 'http:') {
        warnings.push(`${fileName}: Non-HTTPS link: ${url}`);
      }

      // Check if it's an authority domain
      const isAuthority = AUTHORITY_DOMAINS.some(domain => 
        urlObj.hostname.includes(domain)
      );

      if (isAuthority) {
        console.log(`  ✓ Authority domain: ${urlObj.hostname}`);
      }

      // Check URL accessibility
      const result = await checkUrl(url);
      
      if (!result.ok) {
        if (result.error) {
          errors.push(`${fileName}: Link error (${result.error}): ${url}`);
        } else {
          errors.push(`${fileName}: Link returns ${result.status}: ${url}`);
        }
      } else if (result.redirected) {
        warnings.push(`${fileName}: Link redirects (${result.status}): ${url}`);
      }

    } catch (error) {
      errors.push(`${fileName}: Invalid URL: ${url}`);
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      await scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.tsx', '.jsx', '.md', '.mdx'].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('http://') || content.includes('https://')) {
          console.log(`Checking ${path.relative(process.cwd(), fullPath)}...`);
          await validateLinks(fullPath, content);
        }
      }
    }
  }
}

console.log('🔍 Validating external links...\n');

(async () => {
  // Check src directory
  const srcDir = path.join(__dirname, '../src');
  if (fs.existsSync(srcDir)) {
    await scanDirectory(srcDir);
  }

  // Check content directory
  const contentDir = path.join(__dirname, '../content');
  if (fs.existsSync(contentDir)) {
    await scanDirectory(contentDir);
  }

  console.log('');

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
    console.log(`Checked ${checkedUrls.size} unique URLs`);
    process.exit(1);
  } else {
    console.log(`✅ All external links validated successfully (${warnings.length} warning(s))`);
    console.log(`Checked ${checkedUrls.size} unique URLs`);
    process.exit(0);
  }
})();
