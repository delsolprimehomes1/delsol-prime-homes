import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const MIN_AI_SCORE = 9.8;
const errors = [];
const warnings = [];

async function checkBlogPosts() {
  console.log('Checking blog posts AI scores...');
  
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('slug, title, ai_score, ai_score_details')
    .eq('published', true);

  if (error) {
    console.error('Error fetching blog posts:', error);
    return;
  }

  for (const post of posts) {
    if (!post.ai_score) {
      warnings.push(`Blog post "${post.title}" (${post.slug}) has no AI score`);
      continue;
    }

    if (post.ai_score < MIN_AI_SCORE) {
      const issues = [];
      if (post.ai_score_details) {
        try {
          const details = JSON.parse(post.ai_score_details);
          Object.entries(details).forEach(([key, value]) => {
            if (typeof value === 'number' && value < 1) {
              issues.push(`${key}: ${value.toFixed(2)}/1.0`);
            }
          });
        } catch (e) {
          // Ignore JSON parse errors
        }
      }

      const issueText = issues.length > 0 ? `\n      Issues: ${issues.join(', ')}` : '';
      errors.push(
        `Blog post "${post.title}" (${post.slug})\n` +
        `      AI Score: ${post.ai_score.toFixed(2)}/${MIN_AI_SCORE} (BELOW THRESHOLD)${issueText}`
      );
    }
  }
}

async function checkQAArticles() {
  console.log('Checking Q&A articles AI scores...');
  
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('slug, question, ai_score, ai_score_details')
    .eq('published', true);

  if (error) {
    console.error('Error fetching Q&A articles:', error);
    return;
  }

  for (const article of articles) {
    if (!article.ai_score) {
      warnings.push(`Q&A article "${article.question}" (${article.slug}) has no AI score`);
      continue;
    }

    if (article.ai_score < MIN_AI_SCORE) {
      const issues = [];
      if (article.ai_score_details) {
        try {
          const details = JSON.parse(article.ai_score_details);
          Object.entries(details).forEach(([key, value]) => {
            if (typeof value === 'number' && value < 1) {
              issues.push(`${key}: ${value.toFixed(2)}/1.0`);
            }
          });
        } catch (e) {
          // Ignore JSON parse errors
        }
      }

      const issueText = issues.length > 0 ? `\n      Issues: ${issues.join(', ')}` : '';
      errors.push(
        `Q&A article "${article.question}" (${article.slug})\n` +
        `      AI Score: ${article.ai_score.toFixed(2)}/${MIN_AI_SCORE} (BELOW THRESHOLD)${issueText}`
      );
    }
  }
}

console.log('🔍 Checking AI scores...\n');
console.log(`Minimum required AI score: ${MIN_AI_SCORE}/10.0\n`);

(async () => {
  try {
    await checkBlogPosts();
    await checkQAArticles();

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
      console.log(`Found ${errors.length} article(s) below AI score threshold`);
      console.log(`\n💡 Fix suggestions:`);
      console.log(`  - Add more authoritative external links`);
      console.log(`  - Enhance speakable content sections`);
      console.log(`  - Improve E-E-A-T signals (expertise, authority, trustworthiness)`);
      console.log(`  - Add more structured data (FAQs, key takeaways)`);
      console.log(`  - Ensure proper JSON-LD schema markup`);
      process.exit(1);
    } else {
      console.log(`✅ All published articles meet AI score requirements (${MIN_AI_SCORE}/10.0)`);
      console.log(`   ${warnings.length} article(s) without scores (not blocking)`);
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
})();
