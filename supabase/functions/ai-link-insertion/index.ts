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
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    
    // Enhanced API key validation
    console.log(`=== API KEY VALIDATION ===`);
    console.log(`PERPLEXITY_API_KEY: ${PERPLEXITY_API_KEY ? 'Present' : 'Missing'}`);
    console.log(`PERPLEXITY Format: ${PERPLEXITY_API_KEY ? (PERPLEXITY_API_KEY.startsWith('pplx-') ? '✓ Valid (pplx-)' : '✗ Invalid format') : 'N/A'}`);
    console.log(`PERPLEXITY Length: ${PERPLEXITY_API_KEY?.length || 0} chars`);
    console.log(`OPENAI_API_KEY: ${OPENAI_API_KEY ? 'Present' : 'Missing'}`);
    console.log(`OPENAI Format: ${OPENAI_API_KEY ? (OPENAI_API_KEY.startsWith('sk-') ? '✓ Valid (sk-)' : '✗ Invalid format') : 'N/A'}`);
    console.log(`OPENAI Length: ${OPENAI_API_KEY?.length || 0} chars`);
    
    if (!OPENAI_API_KEY && !PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing API Keys',
          details: {
            message: 'Both PERPLEXITY_API_KEY and OPENAI_API_KEY are missing',
            fix: 'Set at least one API key in Supabase Edge Function Secrets'
          }
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!PERPLEXITY_API_KEY) {
      console.warn('⚠️ PERPLEXITY_API_KEY not configured, will use OpenAI only');
    }
    if (!OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY not configured, will use Perplexity only');
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

    // Use Perplexity for external links (real-time web search) with OpenAI fallback
    let externalSuggestions;
    let externalCitations = [];
    
    if (PERPLEXITY_API_KEY) {
      try {
        console.log('Using Perplexity for external link discovery...');
        const perplexityPrompt = `Analyze this Costa del Sol real estate article and find 4-6 authoritative external sources.

Title: ${article.title}
Content: ${article.content.substring(0, 3000)}
Topic: ${article.topic}

${topicGuidelines}

Search the web for REAL, currently accessible URLs from:
${prioritySources}

For each source:
1. Identify exact phrase in article (2-6 words)
2. Find the BEST authoritative URL
3. Verify URL exists and is relevant
4. Explain why it adds value

Return JSON format:
{
  "externalLinks": [
    {
      "anchorText": "exact phrase from article",
      "url": "https://real-authoritative-source.com",
      "reason": "Why this source is authoritative",
      "domainType": "government|financial|legal|statistics",
      "context": "Surrounding sentence"
    }
  ]
}

CRITICAL:
- Only return REAL URLs found via web search
- Anchor text must be EXACT text from article
- NO PDFs, only HTML pages
- Match source type to article topic strictly`;

        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are a research assistant with real-time web access. Find and verify actual URLs. Return valid JSON with citations.'
              },
              {
                role: 'user',
                content: perplexityPrompt
              }
            ],
            temperature: 0.2,
            return_citations: true,
            search_recency_filter: 'month'
          })
        });

        if (!perplexityResponse.ok) {
          const errorBody = await perplexityResponse.text();
          console.error(`\n=== PERPLEXITY API ERROR ===`);
          console.error(`Status: ${perplexityResponse.status} ${perplexityResponse.statusText}`);
          console.error(`Response Body: ${errorBody}`);
          console.error(`API Key Present: ${!!PERPLEXITY_API_KEY}`);
          console.error(`API Key Format: ${PERPLEXITY_API_KEY?.substring(0, 8)}... (${PERPLEXITY_API_KEY?.length} chars)`);
          console.error(`Model: llama-3.1-sonar-large-128k-online`);
          
          // Provide specific error guidance
          let errorMessage = `Perplexity API failed with status ${perplexityResponse.status}`;
          if (perplexityResponse.status === 401) {
            errorMessage = 'Perplexity API key is invalid or expired. Check PERPLEXITY_API_KEY in Supabase secrets.';
          } else if (perplexityResponse.status === 429) {
            errorMessage = 'Perplexity API rate limit exceeded. Wait a few minutes or upgrade your plan.';
          } else if (perplexityResponse.status === 402) {
            errorMessage = 'Perplexity API credits exhausted. Add credits to your account.';
          } else if (perplexityResponse.status === 403) {
            errorMessage = 'Perplexity API access forbidden. Check model access permissions for your tier.';
          }
          
          throw new Error(errorMessage);
        }

        const perplexityData = await perplexityResponse.json();
        externalCitations = perplexityData.citations || [];
        console.log(`Perplexity found ${externalCitations.length} citation sources`);
        
        const responseText = perplexityData.choices[0].message.content;
        
        // Parse JSON response
        try {
          externalSuggestions = JSON.parse(responseText);
        } catch {
          // If not JSON, try to extract structured data
          console.warn('Failed to parse Perplexity JSON, using fallback');
          externalSuggestions = { externalLinks: [] };
        }

        // Validate each suggestion against Perplexity's citations
        const validatedByPerplexity = [];
        for (const link of externalSuggestions.externalLinks || []) {
          const citation = externalCitations.find(c => c.url === link.url);
          
          if (citation) {
            validatedByPerplexity.push({
              ...link,
              citationTitle: citation.title,
              verifiedBySearch: true
            });
            console.log(`✓ Perplexity verified: ${link.url}`);
          } else {
            console.log(`⚠ URL not in citations: ${link.url}`);
            validatedByPerplexity.push(link);
          }
        }
        
        externalSuggestions.externalLinks = validatedByPerplexity;
        console.log(`Generated ${externalSuggestions.externalLinks?.length || 0} Perplexity-backed links`);
        
      } catch (perplexityError) {
        console.error('Perplexity failed, falling back to OpenAI:', perplexityError.message);
        
        // Fallback to OpenAI
        console.log('Using OpenAI fallback for external links...');
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
          const errorBody = await externalResponse.text();
          console.error(`\n=== OPENAI API ERROR (FALLBACK) ===`);
          console.error(`Status: ${externalResponse.status} ${externalResponse.statusText}`);
          console.error(`Response Body: ${errorBody}`);
          console.error(`API Key Present: ${!!OPENAI_API_KEY}`);
          console.error(`API Key Format: ${OPENAI_API_KEY?.substring(0, 8)}... (${OPENAI_API_KEY?.length} chars)`);
          console.error(`Model: gpt-4o`);
          console.error(`Previous Perplexity Error: ${perplexityError.message}`);
          
          // Provide specific error guidance
          let openaiErrorMessage = `OpenAI API failed with status ${externalResponse.status}`;
          if (externalResponse.status === 401) {
            openaiErrorMessage = 'OpenAI API key is invalid or expired. Check OPENAI_API_KEY in Supabase secrets.';
          } else if (externalResponse.status === 429) {
            openaiErrorMessage = 'OpenAI API rate limit exceeded. Wait a few minutes or check your usage.';
          } else if (externalResponse.status === 402) {
            openaiErrorMessage = 'OpenAI API credits exhausted. Add credits to your account.';
          } else if (externalResponse.status === 403) {
            openaiErrorMessage = 'OpenAI API access forbidden. Check model access for your tier (gpt-4o requires paid plan).';
          }
          
          // Return detailed error for both failures
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Both Perplexity and OpenAI Failed',
              details: {
                perplexityError: perplexityError.message,
                perplexityKeyPresent: !!PERPLEXITY_API_KEY,
                openaiError: openaiErrorMessage,
                openaiKeyPresent: !!OPENAI_API_KEY,
                recommendation: 'Verify both API keys are valid and have sufficient credits. Check function logs for details.'
              }
            }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const externalData = await externalResponse.json();
        externalSuggestions = JSON.parse(externalData.choices[0].message.content);
        console.log(`Generated ${externalSuggestions.externalLinks?.length || 0} OpenAI link suggestions`);
      }
    } else {
      // OpenAI only
      console.log('Using OpenAI for external links (Perplexity not configured)...');
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
        const errorBody = await externalResponse.text();
        console.error(`\n=== OPENAI API ERROR (PRIMARY) ===`);
        console.error(`Status: ${externalResponse.status} ${externalResponse.statusText}`);
        console.error(`Response Body: ${errorBody}`);
        console.error(`API Key Present: ${!!OPENAI_API_KEY}`);
        console.error(`API Key Format: ${OPENAI_API_KEY?.substring(0, 8)}... (${OPENAI_API_KEY?.length} chars)`);
        console.error(`Model: gpt-4o`);
        
        let errorMessage = `OpenAI API failed with status ${externalResponse.status}`;
        if (externalResponse.status === 401) {
          errorMessage = 'OpenAI API key is invalid or expired. Check OPENAI_API_KEY in Supabase secrets.';
        } else if (externalResponse.status === 429) {
          errorMessage = 'OpenAI API rate limit exceeded. Wait a few minutes or check your usage.';
        } else if (externalResponse.status === 402) {
          errorMessage = 'OpenAI API credits exhausted. Add credits to your account.';
        } else if (externalResponse.status === 403) {
          errorMessage = 'OpenAI API access forbidden. Check model access for your tier (gpt-4o requires paid plan).';
        }
        
        return new Response(
          JSON.stringify({
            success: false,
            error: errorMessage,
            details: {
              status: externalResponse.status,
              apiKeyPresent: !!OPENAI_API_KEY,
              model: 'gpt-4o',
              body: errorBody.substring(0, 500)
            }
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const externalData = await externalResponse.json();
      externalSuggestions = JSON.parse(externalData.choices[0].message.content);
      console.log(`Generated ${externalSuggestions.externalLinks?.length || 0} OpenAI link suggestions`);
    }

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
    
    // Fetch MORE articles with better topic filtering
    const { data: allArticles } = await supabase
      .from('qa_articles')
      .select('id, title, slug, topic, excerpt, summary, content')
      .eq('language', article.language || 'en')
      .neq('id', articleId)
      .eq('published', true)
      .limit(50);
    
    // Filter by topic similarity
    const relatedArticles = (allArticles || []).filter(a => {
      const topicMatch = a.topic?.toLowerCase() === article.topic?.toLowerCase();
      const titleMatch = a.title?.toLowerCase().includes(article.topic?.toLowerCase() || '');
      return topicMatch || titleMatch;
    }).slice(0, 30);

    const internalLinkPrompt = `Find natural internal linking opportunities.

Current Article: "${article.title}"
Content: ${article.content.substring(0, 2000)}

Available Internal Articles:
${relatedArticles.slice(0, 30).map(a => 
  `- [${a.slug}] ${a.title} (${a.topic})\n  Summary: ${a.summary || a.excerpt?.substring(0, 100) || ''}`
).join('\n')}

TASK: Find 3-5 phrases in the current article where linking to these internal articles would help readers.

RULES:
1. Anchor text must be EXACT text from current article (3-8 words)
2. Link must genuinely add value (not forced)
3. Prefer QA articles that answer specific questions
4. Topic relevance is critical
5. Don't over-link - only where natural

Return JSON:
{
  "internalLinks": [
    {
      "anchorText": "NIE number application",
      "targetSlug": "nie-number-guide-spain",
      "targetTitle": "Complete NIE Number Guide",
      "relevanceScore": 95,
      "reason": "Answers the specific question about NIE process",
      "context": "You'll need to complete the NIE number application before purchasing"
    }
  ]
}`;

    // Use Perplexity for semantic matching if available, otherwise OpenAI
    let internalSuggestions;
    
    if (PERPLEXITY_API_KEY) {
      try {
        console.log('Using Perplexity for internal link discovery...');
        const internalResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              { role: 'system', content: 'Find internal linking opportunities. Return valid JSON.' },
              { role: 'user', content: internalLinkPrompt }
            ],
            temperature: 0.2
          })
        });

        if (!internalResponse.ok) {
          throw new Error(`Perplexity internal links failed: ${internalResponse.status}`);
        }

        const internalData = await internalResponse.json();
        internalSuggestions = JSON.parse(internalData.choices[0].message.content);
        console.log(`Perplexity found ${internalSuggestions.internalLinks?.length || 0} internal links`);
        
      } catch (perplexityError) {
        console.error('Perplexity internal links failed, using OpenAI:', perplexityError.message);
        
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
        internalSuggestions = JSON.parse(internalData.choices[0].message.content);
      }
    } else {
      console.log('Using OpenAI for internal links...');
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
      internalSuggestions = JSON.parse(internalData.choices[0].message.content);
    }
    
    // Validate internal links with stricter checks
    const validatedInternal = [];
    const skippedInternal = [];
    
    for (const link of internalSuggestions.internalLinks || []) {
      // Verify target article exists
      const targetArticle = relatedArticles?.find(a => a.slug === link.targetSlug);
      
      if (!targetArticle) {
        skippedInternal.push({
          targetSlug: link.targetSlug,
          anchorText: link.anchorText,
          reason: 'Article not found in database'
        });
        console.log(`✗ Skipped internal link: ${link.targetSlug} (not found)`);
        continue;
      }
      
      // Verify anchor text exists in source article
      const anchorLower = link.anchorText.toLowerCase();
      const contentLower = article.content.toLowerCase();
      
      if (!contentLower.includes(anchorLower)) {
        skippedInternal.push({
          targetSlug: link.targetSlug,
          anchorText: link.anchorText,
          reason: 'Anchor text not found in article'
        });
        console.log(`✗ Skipped internal link: "${link.anchorText}" not in content`);
        continue;
      }
      
      // Check relevance score (only accept 80+)
      const relevanceScore = link.relevanceScore || 0;
      if (relevanceScore < 80 && relevanceScore > 0) {
        skippedInternal.push({
          targetSlug: link.targetSlug,
          anchorText: link.anchorText,
          reason: `Low relevance score: ${relevanceScore}`
        });
        console.log(`✗ Skipped internal link: Low relevance (${relevanceScore}/100)`);
        continue;
      }
      
      validatedInternal.push({
        ...link,
        url: `/${article.language || 'en'}/qa/${link.targetSlug}`,
        targetId: targetArticle.id
      });
      console.log(`✓ Validated internal link: [${link.anchorText}] → ${link.targetSlug} (${relevanceScore}/100)`);
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
