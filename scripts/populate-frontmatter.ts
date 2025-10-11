#!/usr/bin/env node

/**
 * Populate missing frontmatter fields in Supabase
 * - Geo coordinates (SQL)
 * - Authors (SQL) 
 * - Speakable questions/answers (AI with Claude)
 */

import { createClient } from '@supabase/supabase-client';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qvrbaovlmoudxchipvzksh.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Stats tracking
const stats = {
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  geoUpdated: 0,
  authorUpdated: 0,
  speakableGenerated: 0,
  errors: [] as string[],
};

/**
 * Generate speakable Q&A using Claude
 */
async function generateSpeakable(article: any): Promise<{ questions: string[], answer: string } | null> {
  try {
    const content = article.content?.substring(0, 1500) || article.excerpt || '';
    const language = article.language || 'en';
    
    const prompt = `Generate voice-optimized Q&A for this ${language} real estate article:

TITLE: ${article.title}
CONTENT: ${content}

Generate in ${language} language:
1. speakable_questions: 3-5 natural questions (total 40-60 words)
2. speakable_answer: Direct conversational answer (40-60 words)

Return ONLY valid JSON:
{
  "questions": ["Question 1?", "Question 2?", "Question 3?"],
  "answer": "Natural conversational answer..."
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Claude API error: ${error}`);
      return null;
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content);
      return null;
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
    
  } catch (error) {
    console.error('Error generating speakable:', error);
    return null;
  }
}

/**
 * STEP 1: Update geo coordinates (FAST - SQL)
 */
async function updateGeoCoordinates() {
  console.log('\n📍 STEP 1: Updating geo coordinates...\n');
  
  try {
    // QA Articles
    const { data: qaData, error: qaError } = await supabase
      .from('qa_articles')
      .update({
        geo_coordinates: {
          lat: 36.5099,
          lng: -4.8850,
          region: 'ES-AN',
          place: 'Costa del Sol, Spain',
          country: 'ES',
        },
        area_served: ['Marbella', 'Estepol', 'Fuengirola', 'Benalmádena', 'Mijas', 'Torrox', 'Nerja'],
      })
      .is('geo_coordinates', null);

    if (qaError) {
      console.error('Error updating QA geo:', qaError);
    } else {
      const count = qaData?.length || 0;
      stats.geoUpdated += count;
      console.log(`✅ Updated ${count} QA articles with geo coordinates`);
    }

    // Blog Posts
    const { data: blogData, error: blogError } = await supabase
      .from('blog_posts')
      .update({
        geo_coordinates: {
          lat: 36.5099,
          lng: -4.8850,
          region: 'ES-ES',
          place: 'Costa del Sol, Spain',
          country: 'ES',
        },
        area_served: ['Marbella', 'Estepol', 'Fuengirola', 'Benalmádena', 'Mijas', 'Torrox', 'Nerja'],
      })
      .is('geo_coordinates', null);

    if (blogError) {
      console.error('Error updating blog geo:', blogError);
    } else {
      const count = blogData?.length || 0;
      stats.geoUpdated += count;
      console.log(`✅ Updated ${count} blog posts with geo coordinates`);
    }

    console.log(`\n✅ Total geo updates: ${stats.geoUpdated}`);
    
  } catch (error) {
    console.error('Geo update failed:', error);
  }
}

/**
 * STEP 2: Assign authors (FAST - SQL)
 */
async function assignAuthors() {
  console.log('\n👤 STEP 2: Assigning authors...\n');
  
  try {
    // Get Hans Beeckman's ID
    const { data: authors } = await supabase
      .from('content_authors')
      .select('id, name')
      .eq('name', 'Hans Beeckman')
      .single();

    if (!authors) {
      console.log('⚠️  No author found - skipping');
      return;
    }

    // Update QA articles
    const { data: qaData, error: qaError } = await supabase
      .from('qa_articles')
      .update({ author_id: authors.id })
      .is('author_id', null);

    if (!qaError) {
      const count = qaData?.length || 0;
      stats.authorUpdated += count;
      console.log(`✅ Assigned author to ${count} QA articles`);
    }

    // Update blog posts
    const { data: blogData, error: blogError } = await supabase
      .from('blog_posts')
      .update({ author_id: authors.id })
      .is('author_id', null);

    if (!blogError) {
      const count = blogData?.length || 0;
      stats.authorUpdated += count;
      console.log(`✅ Assigned author to ${count} blog posts`);
    }

    console.log(`\n✅ Total author assignments: ${stats.authorUpdated}`);
    
  } catch (error) {
    console.error('Author assignment failed:', error);
  }
}

/**
 * STEP 3: Generate speakable content (SLOW - AI)
 */
async function generateSpeakableContent() {
  console.log('\n🎤 STEP 3: Generating speakable content...\n');
  
  try {
    // Get articles without speakable content
    const { data: articles, error } = await supabase
      .from('qa_articles')
      .select('id, title, content, excerpt, language')
      .is('speakable_questions', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      return;
    }

    if (!articles || articles.length === 0) {
      console.log('✅ All articles already have speakable content');
      return;
    }

    stats.total = articles.length;
    console.log(`📊 Processing ${articles.length} articles...\n`);

    // Process in batches of 20
    const BATCH_SIZE = 20;
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, Math.min(i + BATCH_SIZE, articles.length));
      
      for (const article of batch) {
        stats.processed++;
        
        try {
          console.log(`[${stats.processed}/${stats.total}] ${article.title.substring(0, 50)}...`);
          
          // Generate speakable content
          const result = await generateSpeakable(article);
          
          if (result) {
            // Update database
            const { error: updateError } = await supabase
              .from('qa_articles')
              .update({
                speakable_questions: result.questions,
                speakable_answer: result.answer,
                updated_at: new Date().toISOString(),
              })
              .eq('id', article.id);

            if (updateError) {
              console.error(`❌ Failed to update ${article.id}:`, updateError);
              stats.failed++;
              stats.errors.push(`${article.title}: ${updateError.message}`);
            } else {
              stats.success++;
              stats.speakableGenerated++;
              console.log(`✅ Generated for: ${article.title.substring(0, 50)}`);
            }
          } else {
            stats.failed++;
            stats.errors.push(`${article.title}: Failed to generate content`);
            console.log(`❌ Failed to generate for: ${article.title}`);
          }
          
          // Rate limiting: 2 second delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          stats.failed++;
          stats.errors.push(`${article.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error(`❌ Error processing ${article.title}:`, error);
        }
      }
      
      // Progress update
      console.log(`\n📊 Progress: ${stats.processed}/${stats.total} (${Math.round(stats.processed / stats.total * 100)}%)\n`);
    }
    
  } catch (error) {
    console.error('Speakable generation failed:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting frontmatter population...\n');
  console.log('═'.repeat(60));
  
  if (!ANTHROPIC_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set in environment!');
    console.log('\nSet it with:');
    console.log('export ANTHROPIC_API_KEY="your-key-here"');
    process.exit(1);
  }

  // Step 1: Geo coordinates (FAST)
  await updateGeoCoordinates();
  
  // Step 2: Authors (FAST)
  await assignAuthors();
  
  // Step 3: Speakable content (SLOW)
  await generateSpeakableContent();
  
  // Final summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 FINAL REPORT');
  console.log('═'.repeat(60));
  console.log(`Geo coordinates updated: ${stats.geoUpdated}`);
  console.log(`Authors assigned: ${stats.authorUpdated}`);
  console.log(`Speakable content generated: ${stats.speakableGenerated}`);
  console.log(`\nTotal processed: ${stats.processed}`);
  console.log(`✅ Success: ${stats.success}`);
  console.log(`❌ Failed: ${stats.failed}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more`);
    }
  }
  
  console.log('\n✨ Frontmatter population complete!\n');
}

// Run script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
