import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced URL validator with retry logic
async function validateUrlWithRetry(url: string, maxRetries = 2): Promise<{
  valid: boolean;
  status?: number;
  reason?: string;
}> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(10000), // 10 seconds
        headers: { 
          'User-Agent': 'Mozilla/5.0 (compatible; DelSolLinkValidator/1.0)'
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        
        // Explicitly reject PDFs
        if (contentType.includes('application/pdf')) {
          return { valid: false, reason: 'PDF files not allowed - prefer HTML pages' };
        }
        
        const isValidPage = contentType.includes('text/html') || 
                            contentType.includes('application/xhtml') ||
                            contentType.includes('text/plain');
        
        if (isValidPage) {
          return { valid: true, status: response.status };
        }
        return { valid: false, reason: `Invalid content-type: ${contentType}` };
      }
      
      // Retry on server errors but not on 404s
      if (attempt < maxRetries && response.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      return { valid: false, reason: `HTTP ${response.status}` };
      
    } catch (e) {
      const isTimeout = e.message.includes('AbortError') || e.message.includes('timeout');
      
      if (attempt < maxRetries && isTimeout) {
        console.log(`Retry ${attempt}/${maxRetries} for ${url}: ${e.message}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      return { valid: false, reason: e.message };
    }
  }
  return { valid: false, reason: 'Max retries exceeded' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, articleType } = await req.json();
    
    if (!articleId || !articleType) {
      throw new Error('Missing required fields: articleId, articleType');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch article
    const table = articleType === 'blog' ? 'blog_posts' : 'qa_articles';
    const { data: article, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      throw new Error(`Failed to fetch article: ${fetchError?.message}`);
    }

    console.log(`Processing article: ${article.title}`);

    // ===== STEP 1: GENERATE EXTERNAL LINKS =====
    
    // Detect topic category for context-aware linking
    const articleTopic = (article.topic || '').toLowerCase();
    const titleLower = (article.title || '').toLowerCase();
    const contentSample = (article.content || '').substring(0, 500).toLowerCase();
    
    const isFinanceTopic = articleTopic.includes('finance') || 
                          articleTopic.includes('mortgage') ||
                          titleLower.includes('mortgage') ||
                          titleLower.includes('finance') ||
                          contentSample.includes('mortgage') ||
                          contentSample.includes('loan-to-value');
    
    const isLegalTopic = articleTopic.includes('legal') ||
                        titleLower.includes('legal') ||
                        titleLower.includes('notary') ||
                        titleLower.includes('contract');
    
    const isLocationTopic = articleTopic.includes('lifestyle') ||
                           articleTopic.includes('location') ||
                           titleLower.includes('where to') ||
                           titleLower.includes('area');
    
    // Build topic-specific priority sources
    let prioritySources = '';
    let topicGuidelines = '';
    let badExamples = '';
    
    if (isFinanceTopic) {
      prioritySources = `
   - Spanish Bank: bde.es (Banco de España)
   - Mortgage authorities: age.es (Spanish Mortgage Association)
   - Tax authorities: agenciatributaria.es
   - Financial guides: expatica.com/es/finance, kyero.com/guides/mortgage
   - Banking institutions: santander.es, bbva.com (mortgage pages only)
   - Government finance: tesoro.es`;
      
      topicGuidelines = `
⚠️ FINANCE TOPIC DETECTED - STRICT RULES:
- NEVER link to tourism boards (NO andalucia.org, NO spain.info for finance content)
- NEVER link to generic location pages
- ONLY link to financial authorities, banks, government tax sites, or finance-specific guides
- Avoid PDFs - prefer HTML pages with interactive content`;
      
      badExamples = `
❌ BAD EXAMPLES FOR FINANCE ARTICLES:
- "Costa del Sol" → andalucia.org (WRONG: tourism site for finance topic)
- "Spanish mortgages" → PDF document (WRONG: prefer HTML pages)
- "Marbella property" → marbella.es/tourism (WRONG: not finance-related)

✅ GOOD EXAMPLES FOR FINANCE ARTICLES:
- "Mortgages for non-residents" → bde.es or expatica.com/es/finance/mortgages
- "loan-to-value ratios" → age.es or bank mortgage pages
- "tax obligations" → agenciatributaria.es`;
    } else if (isLegalTopic) {
      prioritySources = `
   - Notaries: notaries.es, notariado.org
   - Property registry: registradores.org
   - Legal databases: boe.es (official state bulletin)
   - Government: mjusticia.gob.es
   - EU legal: eur-lex.europa.eu`;
      
      topicGuidelines = `
⚠️ LEGAL TOPIC DETECTED:
- Prioritize official legal sources and government sites
- Link to actual legal texts and official registries
- Avoid commercial legal services unless official bodies`;
    } else if (isLocationTopic) {
      prioritySources = `
   - Tourism boards: andalucia.org, spain.info
   - City websites: malaga.eu, marbella.es, estepona.es
   - Cultural sites: museums, UNESCO sites
   - Regional government: juntadeandalucia.es`;
      
      topicGuidelines = `
⚠️ LOCATION/LIFESTYLE TOPIC DETECTED:
- Tourism and location sites are appropriate here
- Focus on cultural, lifestyle, and regional information`;
    } else {
      // Default for property market, investment, etc.
      prioritySources = `
   - Government: .gov, .gov.es, .gob.es sites
   - Statistics: ine.es, eurostat.ec.europa.eu
   - EU institutions: europa.eu, ec.europa.eu
   - Established publications: Financial Times, Bloomberg, Reuters
   - Industry bodies: official real estate associations`;
      
      topicGuidelines = `
- Match link topic to article topic strictly
- Prefer official statistics and government data`;
    }
    
    const externalLinkPrompt = `You are an expert content editor adding authoritative external links to real estate content.

Article Title: ${article.title}
Article Topic: ${article.topic || 'Costa del Sol real estate'}

Article Content:
${article.content}

TASK: Find 4-8 phrases in this article that would benefit from external links to authoritative sources.

${topicGuidelines}

PRIORITY SOURCES FOR THIS TOPIC:
${prioritySources}

UNIVERSAL RULES:
1. Use EXACT text already in the article (2-6 words)
2. Find REAL, authoritative URLs for each phrase
3. Each link must:
   - Be an HTML page (NOT PDF, NOT download)
   - Be accessible and load within 10 seconds
   - Match the TOPIC of the article (not just the location)
   - Point to a REAL, accessible URL (HTTPS only)
   - Add genuine value to readers
   - Be from a domain with high authority (DA 60+)

${badExamples}

EXAMPLE OUTPUT FORMAT:
{
  "externalLinks": [
    {
      "anchorText": "exact phrase from article",
      "url": "https://authoritative-source.com/relevant-page",
      "reason": "Why this source is authoritative and relevant",
      "domainType": "government|financial|legal|tourism|statistics",
      "context": "Surrounding sentence for context"
    }
  ]
}

CRITICAL: 
- anchorText must be EXACT text from the article
- URLs must be REAL and currently accessible HTML pages
- NO PDFs, NO downloads
- Match source type to article topic strictly
- Return valid JSON only`;

    console.log('Calling OpenAI for external links...');
    const externalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Find REAL authoritative URLs. Return valid JSON only.'
          },
          {
            role: 'user',
            content: externalLinkPrompt
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error('OpenAI external links error:', externalResponse.status, errorText);
      throw new Error(`OpenAI request failed: ${externalResponse.status}`);
    }

    const externalData = await externalResponse.json();
    const externalSuggestions = JSON.parse(externalData.choices[0].message.content);
    console.log(`Generated ${externalSuggestions.externalLinks?.length || 0} external link suggestions`);

    // ===== STEP 2: VALIDATE EXTERNAL URLS =====
    
    const validatedExternal = [];
    const rejectedLinks = [];
    
    console.log(`\n🔍 Validating ${externalSuggestions.externalLinks?.length || 0} external URLs...`);
    
    for (const link of externalSuggestions.externalLinks || []) {
      const validation = await validateUrlWithRetry(link.url);
      
      if (validation.valid) {
        validatedExternal.push(link);
        console.log(`✓ Validated: ${link.url} (${validation.status})`);
      } else {
        rejectedLinks.push({
          url: link.url,
          anchorText: link.anchorText,
          reason: validation.reason,
          domainType: link.domainType,
          attemptedAt: new Date().toISOString()
        });
        console.log(`✗ Rejected ${link.url}: ${validation.reason}`);
      }
    }

    console.log(`\n=== EXTERNAL LINK VALIDATION ===`);
    console.log(`✓ Valid: ${validatedExternal.length}`);
    console.log(`✗ Rejected: ${rejectedLinks.length}`);
    if (rejectedLinks.length > 0) {
      console.log(`\nRejected URLs:`);
      rejectedLinks.forEach(r => console.log(`  - ${r.url}: ${r.reason}`));
    }

    // ===== STEP 3: GENERATE INTERNAL LINKS =====
    
    const { data: relatedArticles } = await supabase
      .from('qa_articles')
      .select('id, title, slug, topic, excerpt')
      .eq('language', article.language || 'en')
      .neq('id', articleId)
      .eq('published', true)
      .limit(15);

    const internalLinkPrompt = `You are finding opportunities to link to related internal content.

Current Article Content:
${article.content.substring(0, 2000)}

Available Related Articles:
${JSON.stringify((relatedArticles || []).map(a => ({
  title: a.title,
  slug: a.slug,
  topic: a.topic,
  excerpt: a.excerpt?.substring(0, 100)
})), null, 2)}

TASK: Find 2-4 phrases in the current article that naturally link to related articles.

RULES:
1. Use EXACT text from the current article (3-8 words)
2. Link should add value (not forced)
3. Prefer linking to QA articles that answer questions
4. Don't over-link - only where genuinely helpful

EXAMPLE OUTPUT:
{
  "internalLinks": [
    {
      "anchorText": "remote work in 2025",
      "targetSlug": "working-remotely-spain-guide",
      "targetTitle": "Complete Guide to Working Remotely in Spain",
      "reason": "Provides detailed remote work visa and legal requirements",
      "context": "properties are ideal for remote work in 2025"
    }
  ]
}

Return valid JSON only.`;

    console.log('Calling OpenAI for internal links...');
    const internalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Find internal linking opportunities. Return valid JSON.' },
          { role: 'user', content: internalLinkPrompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!internalResponse.ok) {
      console.error('OpenAI internal links error:', internalResponse.status);
    }

    const internalData = await internalResponse.json();
    const internalSuggestions = JSON.parse(internalData.choices[0].message.content);
    
    // Validate internal links exist in database
    const validatedInternal = [];
    const skippedInternal = [];
    
    for (const link of internalSuggestions.internalLinks || []) {
      const exists = relatedArticles?.some(a => a.slug === link.targetSlug);
      
      if (exists) {
        validatedInternal.push({
          ...link,
          url: `/${article.language || 'en'}/qa/${link.targetSlug}`
        });
      } else {
        skippedInternal.push({
          targetSlug: link.targetSlug,
          anchorText: link.anchorText,
          reason: 'Article not found in database'
        });
        console.log(`✗ Skipped internal link: ${link.targetSlug} (article not found)`);
      }
    }

    console.log(`\n=== INTERNAL LINK VALIDATION ===`);
    console.log(`✓ Valid: ${validatedInternal.length}`);
    console.log(`✗ Skipped: ${skippedInternal.length}`);

    // ===== STEP 4: INSERT LINKS INTO CONTENT =====
    
    let updatedContent = article.content;
    let insertedCount = 0;
    let skippedCount = 0;
    const insertionLog = [];

    const allLinks = [
      ...validatedExternal.map(l => ({ text: l.anchorText, url: l.url, type: 'external' })),
      ...validatedInternal.map(l => ({ text: l.anchorText, url: l.url, type: 'internal' }))
    ];

    // Sort by length (longest first to avoid partial matches)
    allLinks.sort((a, b) => b.text.length - a.text.length);

    for (const link of allLinks) {
      const searchText = link.text.toLowerCase();
      const contentLower = updatedContent.toLowerCase();
      const index = contentLower.indexOf(searchText);
      
      if (index === -1) {
        skippedCount++;
        insertionLog.push({ text: link.text, status: 'not_found', type: link.type });
        continue;
      }

      // Get original casing from content
      const originalText = updatedContent.substring(index, index + link.text.length);
      
      // Check if already linked (look for markdown link syntax)
      const before = index > 0 ? updatedContent[index - 1] : ' ';
      const after = updatedContent[index + link.text.length] || ' ';
      
      if (before === '[' || before === '!' || after === ']' || after === '(') {
        skippedCount++;
        insertionLog.push({ text: link.text, status: 'already_linked', type: link.type });
        continue;
      }

      // Check if within existing link
      const beforeContext = updatedContent.substring(Math.max(0, index - 50), index);
      const afterContext = updatedContent.substring(index + link.text.length, index + link.text.length + 50);
      if (beforeContext.includes('[') && afterContext.includes(']') && 
          beforeContext.lastIndexOf('[') > beforeContext.lastIndexOf(']')) {
        skippedCount++;
        insertionLog.push({ text: link.text, status: 'inside_link', type: link.type });
        continue;
      }

      // Insert markdown link
      const beforeText = updatedContent.substring(0, index);
      const afterText = updatedContent.substring(index + link.text.length);
      updatedContent = `${beforeText}[${originalText}](${link.url})${afterText}`;
      
      insertedCount++;
      insertionLog.push({ text: originalText, url: link.url, status: 'inserted', type: link.type });
      console.log(`✓ Inserted ${link.type}: [${originalText}](${link.url})`);
    }

    console.log(`Link insertion complete: ${insertedCount} inserted, ${skippedCount} skipped`);

    // ===== STEP 5: UPDATE DATABASE =====
    
    const { error: updateError } = await supabase
      .from(table)
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update article: ${updateError.message}`);
    }

    // Save link metadata to external_links table
    for (const link of validatedExternal) {
      await supabase.from('external_links').insert({
        article_id: articleId,
        article_type: articleType,
        url: link.url,
        anchor_text: link.anchorText,
        context_snippet: link.context,
        authority_score: 85,
        verified: true,
        insertion_method: 'ai_inline'
      });
    }

    console.log('Successfully completed AI link insertion');

    const validationRate = validatedExternal.length + rejectedLinks.length > 0 
      ? Math.round((validatedExternal.length / (validatedExternal.length + rejectedLinks.length)) * 100)
      : 100;

    return new Response(
      JSON.stringify({
        success: true,
        inserted: insertedCount,
        skipped: skippedCount,
        externalLinks: validatedExternal.length,
        internalLinks: validatedInternal.length,
        rejectedLinks: rejectedLinks,
        skippedInternalLinks: skippedInternal,
        validationSummary: {
          externalValidated: validatedExternal.length,
          externalRejected: rejectedLinks.length,
          validationRate: `${validationRate}%`,
          internalValidated: validatedInternal.length,
          internalSkipped: skippedInternal.length
        },
        insertionLog: insertionLog,
        message: `✅ Added ${insertedCount} inline links (${skippedCount} skipped)\n` +
                 `🔍 External: ${validatedExternal.length} validated, ${rejectedLinks.length} rejected (${validationRate}% success)\n` +
                 `🔗 Internal: ${validatedInternal.length} validated, ${skippedInternal.length} skipped`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-link-insertion:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
