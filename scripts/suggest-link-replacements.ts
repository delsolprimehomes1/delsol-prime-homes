#!/usr/bin/env node

/**
 * AI-Powered Link Replacement Suggester
 * Suggests alternative links from approved domains for broken links
 */

import { createClient } from '@supabase/supabase-sdk';
import { APPROVED_DOMAINS } from '../src/lib/external-links/whitelist';
import { writeFile, mkdir } from 'fs/promises';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qvrbaovlmxchipvzkh.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface LinkReplacement {
  brokenUrl: string;
  article: string;
  context: string;
  suggestions: Array<{
    url: string;
    reason: string;
    relevance: number;
  }>;
}

/**
 * Use Claude to suggest replacement links
 */
async function suggestReplacements(
  brokenUrl: string,
  context: string,
  articleTitle: string
): Promise<Array<{ url: string; reason: string; relevance: number }>> {
  const prompt = `You are a content editor for a luxury real estate website in Spain's Costa del Sol.

TASK: Suggest 3 REAL, WORKING replacement links for a broken link in our article.

BROKEN LINK: ${brokenUrl}
ARTICLE: ${articleTitle}
CONTEXT: ${context}

APPROVED DOMAINS (use ONLY these):
${Object.entries(APPROVED_DOMAINS).map(([cat, domains]) => 
  `${cat}: ${domains.join(', ')}`
).join('\n')}

REQUIREMENTS:
1. Suggest ONLY links from the approved domains above
2. Links must be REAL and RELEVANT to the context
3. Each suggestion must be a specific page/article, NOT just homepage
4. Return ONLY valid JSON, no other text

EXAMPLE RESPONSE:
[
  {
    "url": "https://www.boe.es/buscar/act.jsp?id=XXXXX",
    "reason": "Official Spanish legislation on property rights",
    "relevance": 9
  }
]

Return ONLY the JSON array, nothing else.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
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
      throw new Error(`Claude API error: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No valid JSON in response:', content);
      return [];
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return suggestions;

  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return [];
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Finding broken links...\n');

  // Get all broken links
  const { data: brokenLinks, error } = await supabase
    .from('external_links')
    .select(`
      id,
      url,
      article_id,
      article_type,
      anchor_text,
      context_snippet
    `)
    .eq('health_status', 'broken');

  if (error) {
    console.error('Error fetching broken links:', error);
    process.exit(1);
  }

  if (!brokenLinks || brokenLinks.length === 0) {
    console.log('✅ No broken links found!');
    return;
  }

  console.log(`Found ${brokenLinks.length} broken links\n`);

  const replacements: LinkReplacement[] = [];
  let processed = 0;

  for (const link of brokenLinks) {
    processed++;
    console.log(`[${processed}/${brokenLinks.length}] ${link.url}`);

    try {
      // Get article title
      const { data: article } = link.article_type === 'qa'
        ? await supabase
            .from('qa_articles')
            .select('title')
            .eq('id', link.article_id)
            .single()
        : await supabase
            .from('blog_posts')
            .select('title')
            .eq('id', link.article_id)
            .single();

      if (!article) {
        console.log('  ⚠️  Article not found');
        continue;
      }

      // Get AI suggestions
      const suggestions = await suggestReplacements(
        link.url,
        link.context_snippet || 'No context available',
        article.title
      );

      if (suggestions.length > 0) {
        replacements.push({
          brokenUrl: link.url,
          article: article.title,
          context: link.context_snippet || '',
          suggestions,
        });

        console.log(`  ✅ Found ${suggestions.length} suggestions`);
        suggestions.forEach((s, i) => {
          console.log(`     ${i + 1}. ${s.url} (${s.relevance}/10)`);
        });
      } else {
        console.log('  ❌ No suggestions found');
      }

      // Rate limit: 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`  ❌ Error: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Export to CSV
  await mkdir('reports', { recursive: true });
  const csv = [
    'Broken URL,Article,Context,Suggestion 1,Reason 1,Score 1,Suggestion 2,Reason 2,Score 2,Suggestion 3,Reason 3,Score 3',
    ...replacements.map(r => {
      const s = r.suggestions;
      return [
        `"${r.brokenUrl}"`,
        `"${r.article}"`,
        `"${r.context}"`,
        s[0] ? `"${s[0].url}"` : '',
        s[0] ? `"${s[0].reason}"` : '',
        s[0] ? s[0].relevance : '',
        s[1] ? `"${s[1].url}"` : '',
        s[1] ? `"${s[1].reason}"` : '',
        s[1] ? s[1].relevance : '',
        s[2] ? `"${s[2].url}"` : '',
        s[2] ? `"${s[2].reason}"` : '',
        s[2] ? s[2].relevance : '',
      ].join(',');
    }),
  ].join('\n');

  await writeFile('reports/link-replacements.csv', csv);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Broken links processed: ${brokenLinks.length}`);
  console.log(`Suggestions generated: ${replacements.length}`);
  console.log(`\n📄 Report exported to: reports/link-replacements.csv\n`);
}

main().catch(console.error);
