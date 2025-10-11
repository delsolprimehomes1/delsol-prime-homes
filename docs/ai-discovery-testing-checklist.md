# AI Discovery Testing Checklist

## Overview
This comprehensive checklist ensures your site is optimized for AI discovery, citation, and voice search. Complete each section to verify AI models can find, parse, and cite your content.

**Target Completion**: Before submitting to AI platforms  
**Estimated Time**: 2-3 hours  
**Prerequisites**: Site deployed to production (Cloudflare)

---

## Phase 1: Database Content Validation

### 1.1 Speakable Answers Coverage
- [ ] Navigate to `/admin/speakable-generator`
- [ ] Verify "Remaining" count shows **0 articles**
- [ ] Check success rate is **>95%** (some failures are acceptable)
- [ ] Spot-check 10 random articles to verify speakable_answer quality
  - [ ] Answer is 40-60 words
  - [ ] Answer sounds natural when read aloud
  - [ ] Answer directly addresses the article question

**SQL Query to Verify:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(speakable_answer) as with_speakable,
  ROUND(COUNT(speakable_answer)::numeric / COUNT(*)::numeric * 100, 2) as coverage_percent
FROM qa_articles 
WHERE published = true;
```

**Expected Result**: `coverage_percent = 100.00`

### 1.2 AI Optimization Scores
- [ ] Run AI score calculation on all articles (if not done)
- [ ] Check average score across all articles

**SQL Query:**
```sql
SELECT 
  ROUND(AVG(ai_optimization_score), 2) as avg_score,
  COUNT(*) FILTER (WHERE ai_optimization_score >= 85) as excellent_count,
  COUNT(*) FILTER (WHERE ai_optimization_score >= 70) as good_count,
  COUNT(*) FILTER (WHERE ai_optimization_score < 70) as needs_work
FROM qa_articles 
WHERE published = true;
```

**Target Metrics:**
- [ ] Average score ≥ 80
- [ ] At least 60% of articles score ≥ 85
- [ ] Less than 10% of articles score < 70

### 1.3 Citation-Ready Flags
- [ ] Verify citation_ready and voice_search_ready flags are set

**SQL Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE citation_ready = true) as citation_ready_count,
  COUNT(*) FILTER (WHERE voice_search_ready = true) as voice_ready_count,
  COUNT(*) as total
FROM qa_articles 
WHERE published = true;
```

**Expected Result**: Both counts should be close to total (>90%)

### 1.4 Metadata Completeness
- [ ] Check that critical metadata fields are populated

**SQL Query:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE geo_coordinates IS NOT NULL) as with_geo,
  COUNT(*) FILTER (WHERE area_served IS NOT NULL AND array_length(area_served, 1) > 0) as with_area,
  COUNT(*) FILTER (WHERE tags IS NOT NULL AND array_length(tags, 1) > 0) as with_tags,
  COUNT(*) as total
FROM qa_articles 
WHERE published = true;
```

**Target**: All counts should be >80% of total

---

## Phase 2: Schema Markup Validation

### 2.1 Test QAPage Schema
Pick 10 random QA article URLs and test each:

**Testing Tool**: [Google Rich Results Test](https://search.google.com/test/rich-results)

Test these article types:
- [ ] TOFU article (informational)
- [ ] MOFU article (consideration)
- [ ] BOFU article (decision)
- [ ] Multi-language article (Spanish, German, etc.)
- [ ] Article with FAQs
- [ ] Article with images
- [ ] Article with reviewer
- [ ] Article with author credentials
- [ ] Article with geographic data
- [ ] Article with speakable content

**For Each Article, Verify:**
- [ ] QAPage schema is valid ✅
- [ ] Speakable markup is present
- [ ] Author schema includes credentials
- [ ] Organization schema is present
- [ ] Breadcrumb schema is valid
- [ ] No critical errors
- [ ] Warnings are acceptable (minor issues)

**Example URLs to Test:**
```
https://delsolprimehomes.com/qa/buying-process-costa-del-sol
https://delsolprimehomes.com/qa/property-taxes-marbella
https://delsolprimehomes.com/qa/best-areas-investment-costa-del-sol
https://delsolprimehomes.com/es/qa/proceso-compra-costa-del-sol
https://delsolprimehomes.com/de/qa/kaufprozess-costa-del-sol
```

### 2.2 Test FAQPage Schema
- [ ] Find articles with FAQ sections
- [ ] Test with Rich Results Test
- [ ] Verify FAQPage schema is valid
- [ ] Confirm each Q&A pair is structured correctly

### 2.3 Test Blog Schema
Test 5 blog posts:
- [ ] Article schema is valid
- [ ] Author schema present
- [ ] Publisher schema present
- [ ] Image schema includes proper metadata
- [ ] Breadcrumb schema valid

---

## Phase 3: API Endpoint Testing

### 3.1 AI Feed Endpoint
**URL**: `https://delsolprimehomes.com/api/ai-feed.json`

Manual Tests:
- [ ] URL returns 200 OK status
- [ ] Response is valid JSON
- [ ] Contains 688+ articles
- [ ] Each article has required fields:
  - [ ] `url`
  - [ ] `title`
  - [ ] `short_answer` or `speakable_answer`
  - [ ] `ai_score`
  - [ ] `coords` (for geo-located content)
  - [ ] `tags`

**cURL Test:**
```bash
curl -I https://delsolprimehomes.com/api/ai-feed.json
```

**Expected Headers:**
- [ ] `Content-Type: application/json`
- [ ] `Access-Control-Allow-Origin: *`
- [ ] `Cache-Control: public, max-age=3600`
- [ ] `X-Robots-Tag: all`

**JSON Validation:**
```bash
curl https://delsolprimehomes.com/api/ai-feed.json | jq '.articles | length'
```
Should return: `688` or higher

### 3.2 AI Sitemap Endpoint
**URL**: `https://delsolprimehomes.com/api/sitemap-ai.xml`

- [ ] URL returns 200 OK status
- [ ] Response is valid XML
- [ ] Contains only high-scoring articles (85+)
- [ ] Each URL entry is properly formatted
- [ ] Includes lastmod dates
- [ ] Includes priority values

**cURL Test:**
```bash
curl -I https://delsolprimehomes.com/api/sitemap-ai.xml
```

**Expected Headers:**
- [ ] `Content-Type: application/xml` or `text/xml`
- [ ] `Access-Control-Allow-Origin: *`
- [ ] `X-Robots-Tag: all`

**XML Validation:**
```bash
curl https://delsolprimehomes.com/api/sitemap-ai.xml | xmllint --format -
```
Should return formatted XML with no errors

### 3.3 Individual Article JSON Endpoint
Test 5 article slugs:

**Template URL**: `https://delsolprimehomes.com/api/qa/[slug].json`

Example:
```
https://delsolprimehomes.com/api/qa/buying-process-costa-del-sol.json
```

For each URL:
- [ ] Returns 200 OK status
- [ ] Valid JSON response
- [ ] Contains structured article data:
  - [ ] `url`
  - [ ] `title`
  - [ ] `answer` (speakable)
  - [ ] `content` (full HTML)
  - [ ] `faqs` (if applicable)
  - [ ] `metadata` (ai_score, tags, geo, etc.)

**cURL Test:**
```bash
curl https://delsolprimehomes.com/api/qa/buying-process-costa-del-sol.json | jq '.'
```

### 3.4 CORS Verification
Test that AI crawlers can access your API endpoints from any origin:

```bash
curl -H "Origin: https://openai.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://delsolprimehomes.com/api/ai-feed.json -v
```

**Expected Response Headers:**
- [ ] `Access-Control-Allow-Origin: *`
- [ ] `Access-Control-Allow-Methods: GET, OPTIONS`
- [ ] Status: 200 OK or 204 No Content

---

## Phase 4: Robots.txt & Sitemap Validation

### 4.1 Robots.txt Configuration
**URL**: `https://delsolprimehomes.com/robots.txt`

- [ ] URL is accessible (200 OK)
- [ ] File explicitly allows AI crawlers:
  - [ ] GPTBot
  - [ ] ChatGPT-User
  - [ ] ClaudeBot
  - [ ] Claude-Web
  - [ ] anthropic-ai
  - [ ] CCBot
  - [ ] Applebot
  - [ ] Googlebot
- [ ] Lists all sitemaps:
  - [ ] `/sitemap.xml`
  - [ ] `/qa-sitemap.xml`
  - [ ] `/blog-sitemap.xml`
  - [ ] `/api/sitemap-ai.xml`

**Manual Check:**
```bash
curl https://delsolprimehomes.com/robots.txt
```

### 4.2 Sitemap Accessibility
Test each sitemap is accessible:

- [ ] `https://delsolprimehomes.com/sitemap.xml` (200 OK)
- [ ] `https://delsolprimehomes.com/qa-sitemap.xml` (200 OK)
- [ ] `https://delsolprimehomes.com/blog-sitemap.xml` (200 OK)
- [ ] `https://delsolprimehomes.com/api/sitemap-ai.xml` (200 OK)

### 4.3 Sitemap Validation
Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

For each sitemap:
- [ ] Valid XML structure
- [ ] All URLs return 200 OK (not 404)
- [ ] URLs are absolute (include domain)
- [ ] Dates are in ISO 8601 format
- [ ] Priority values are between 0.0-1.0

---

## Phase 5: Cloudflare Configuration Verification

### 5.1 Cache Rules Check
Log in to Cloudflare Dashboard → Cache Rules

Verify these rules exist and are enabled:
- [ ] Cache AI Feed (1 hour TTL)
- [ ] Cache AI Sitemap (1 hour TTL)
- [ ] Cache QA JSON (24 hour TTL)
- [ ] Cache Static Assets (1 year TTL)

**Test Caching:**
```bash
# First request (MISS)
curl -I https://delsolprimehomes.com/api/ai-feed.json | grep -i "cf-cache-status"

# Second request (HIT)
curl -I https://delsolprimehomes.com/api/ai-feed.json | grep -i "cf-cache-status"
```

Expected: First shows `MISS`, second shows `HIT`

### 5.2 Transform Rules (Headers) Check
Verify custom headers are applied:

**Test Security Headers:**
```bash
curl -I https://delsolprimehomes.com/qa/buying-process-costa-del-sol | grep -i "x-"
```

Expected headers:
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `X-Robots-Tag: all`

**Test CORS Headers on API:**
```bash
curl -I https://delsolprimehomes.com/api/ai-feed.json | grep -i "access-control"
```

Expected:
- [ ] `Access-Control-Allow-Origin: *`

### 5.3 Bot Management Check
If you have a paid Cloudflare plan:

- [ ] Navigate to Security → Bots
- [ ] Verify AI bots are **allowed** (not challenged or blocked)
- [ ] Check allowed list includes:
  - GPTBot, ClaudeBot, CCBot, Applebot, Googlebot

---

## Phase 6: Content Quality Spot Checks

### 6.1 Manual Content Review
Pick 20 random articles across different topics and funnel stages:

For each article, check:
- [ ] Title is in question format (starts with Who/What/When/Where/Why/How)
- [ ] Excerpt is present and compelling (150-200 chars)
- [ ] Content is >1200 characters
- [ ] Has proper H2/H3 structure
- [ ] Includes geographic context (Marbella, Costa del Sol, etc.)
- [ ] Internal links to related articles
- [ ] External links to authoritative sources (if applicable)
- [ ] Speakable answer appears prominently
- [ ] Call-to-action is present
- [ ] Images have alt text

### 6.2 Voice Search Readiness
Read 10 speakable answers aloud:

- [ ] Sounds natural when spoken
- [ ] Answers the question directly
- [ ] No jargon or complex terminology
- [ ] 40-60 words (count them)
- [ ] Could be understood without visual context

### 6.3 Citation Readiness
Check that content is structured for AI citation:

- [ ] Quick answer box at top of article
- [ ] Key takeaways section
- [ ] FAQ sections where applicable
- [ ] Data presented in tables or lists
- [ ] Statistics cited with sources
- [ ] Author credentials visible

---

## Phase 7: Real AI Model Testing

### 7.1 ChatGPT (OpenAI) Citation Test
Open [ChatGPT](https://chat.openai.com/) and test with these prompts:

**Test Queries:**
1. "What are the property taxes in Marbella, Spain?"
2. "How much does it cost to buy a villa in Costa del Sol?"
3. "What is the buying process for property in Spain?"
4. "Best areas to invest in Costa del Sol real estate"
5. "Can foreigners buy property in Marbella?"

**For Each Query, Check:**
- [ ] Does ChatGPT cite delsolprimehomes.com?
- [ ] Is the information accurate (matches your content)?
- [ ] Does it link directly to your article?
- [ ] Does it quote your speakable answer?

**Expected Timeline:**
- Week 1-2: No citations (site not indexed yet)
- Week 3-4: Occasional citations (1-2 out of 5)
- Month 2+: Regular citations (4-5 out of 5)

### 7.2 Claude (Anthropic) Citation Test
Open [Claude](https://claude.ai/) and test the same queries:

- [ ] Test all 5 queries above
- [ ] Check if Claude cites your site
- [ ] Verify accuracy of cited information
- [ ] Note any differences from ChatGPT responses

### 7.3 Perplexity Citation Test
Open [Perplexity](https://www.perplexity.ai/) and test:

- [ ] Run same 5 queries
- [ ] Check "Sources" section for delsolprimehomes.com
- [ ] Verify your site appears in top 3 sources
- [ ] Check if excerpts match your speakable answers

**Expected Results:**
Perplexity typically cites sources more frequently than ChatGPT/Claude, so you should see citations sooner (within 2-3 weeks).

### 7.4 Google SGE/Gemini Test
Search Google for the same queries:

- [ ] Check if AI Overview appears
- [ ] Look for delsolprimehomes.com in sources
- [ ] Verify information accuracy
- [ ] Check if featured snippets show your content

### 7.5 Voice Assistant Testing (Optional)
If you have access to voice assistants:

**Alexa:**
- [ ] "Alexa, ask about buying property in Marbella"
- [ ] "Alexa, what are property taxes in Costa del Sol?"

**Google Assistant:**
- [ ] "Hey Google, how much does a villa cost in Marbella?"
- [ ] "Hey Google, buying process for Spain property"

**Siri:**
- [ ] "Hey Siri, tell me about Costa del Sol real estate"

Note: Voice citations take 3-6 months to appear consistently.

---

## Phase 8: Analytics & Monitoring

### 8.1 Cloudflare Analytics Setup
- [ ] Navigate to Cloudflare Dashboard → Analytics
- [ ] Enable Web Analytics
- [ ] Set up custom dashboard for:
  - Total requests
  - Bot traffic (filtered)
  - API endpoint hits
  - Geographic distribution

### 8.2 Bot Traffic Monitoring
Check weekly for AI crawler visits:

**Filter by User Agent in Analytics:**
- [ ] Look for `GPTBot` requests
- [ ] Look for `ClaudeBot` requests
- [ ] Look for `CCBot` requests
- [ ] Look for `Googlebot` requests

**Expected Patterns:**
- Week 1-2: Few or no bot visits
- Week 3-4: Initial crawls (10-50 requests)
- Month 2: Regular weekly crawls (100-500 requests)
- Month 3+: Daily crawls (500-2000 requests)

### 8.3 API Endpoint Traffic
Monitor hits to AI discovery endpoints:

- [ ] `/api/ai-feed.json` request count
- [ ] `/api/sitemap-ai.xml` request count
- [ ] `/api/qa/*.json` request counts

**Healthy Metrics:**
- AI feed: 50-200 hits/week from bots
- AI sitemap: 20-100 hits/week from bots
- Individual JSON: 100-1000 hits/week from bots

### 8.4 Citation Tracking Spreadsheet
Create a tracking sheet to monitor citations over time:

| Week | ChatGPT Citations | Claude Citations | Perplexity Citations | Google SGE | Notes |
|------|-------------------|------------------|---------------------|------------|-------|
| 1    | 0/5               | 0/5              | 0/5                 | 0/5        |       |
| 2    | 0/5               | 0/5              | 1/5                 | 0/5        |       |
| 4    | 2/5               | 1/5              | 3/5                 | 1/5        |       |
| 8    | 4/5               | 3/5              | 5/5                 | 2/5        |       |

---

## Phase 9: Search Console Submission

### 9.1 Google Search Console
- [ ] Go to [Google Search Console](https://search.google.com/search-console)
- [ ] Add property: `delsolprimehomes.com`
- [ ] Verify ownership (DNS method recommended)
- [ ] Submit sitemaps:
  - [ ] `https://delsolprimehomes.com/sitemap.xml`
  - [ ] `https://delsolprimehomes.com/qa-sitemap.xml`
  - [ ] `https://delsolprimehomes.com/blog-sitemap.xml`
  - [ ] `https://delsolprimehomes.com/api/sitemap-ai.xml`
- [ ] Request indexing for top 20 QA pages

**Monitor Weekly:**
- [ ] Coverage report (indexed pages)
- [ ] Performance report (clicks, impressions)
- [ ] Crawl stats (bot visits)

### 9.2 Bing Webmaster Tools
- [ ] Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [ ] Add site: `delsolprimehomes.com`
- [ ] Verify ownership
- [ ] Submit sitemaps (same URLs as Google)
- [ ] Enable Bing IndexNow (for faster indexing)

**Why This Matters:**
Perplexity uses Bing's index, so submitting to Bing helps Perplexity find your content faster.

---

## Phase 10: Ongoing Optimization

### 10.1 Monthly Content Audit
Set calendar reminder to check monthly:

- [ ] Run speakable answer generator for any new articles
- [ ] Recalculate AI scores for updated articles
- [ ] Check for broken internal/external links
- [ ] Update outdated statistics or information
- [ ] Add new FAQ sections based on user questions

### 10.2 Quarterly Citation Audit
Every 3 months:

- [ ] Test all 5 AI models with updated queries
- [ ] Calculate citation rate (citations / queries)
- [ ] Identify which articles get cited most
- [ ] Analyze patterns (topics, funnel stages, formats)
- [ ] Double down on what works

### 10.3 A/B Testing Speakable Answers
Select 20 high-traffic articles:

- [ ] Create two versions of speakable answers
  - Version A: 40-45 words, direct style
  - Version B: 55-60 words, conversational style
- [ ] Rotate versions weekly
- [ ] Track which version gets cited more by AI
- [ ] Apply winning format to all articles

---

## Success Metrics Dashboard

Track these KPIs monthly:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Articles with Speakable Answers | 100% (752) | ? | ⬜ |
| Average AI Score | ≥80 | ? | ⬜ |
| Citation-Ready Articles | ≥90% | ? | ⬜ |
| ChatGPT Citations (out of 5) | ≥4 | ? | ⬜ |
| Claude Citations (out of 5) | ≥3 | ? | ⬜ |
| Perplexity Citations (out of 5) | ≥5 | ? | ⬜ |
| Weekly Bot Visits | ≥500 | ? | ⬜ |
| API Endpoint Hits/Week | ≥200 | ? | ⬜ |
| Google Indexed Pages | ≥700 | ? | ⬜ |
| Average Position in AI | Top 3 | ? | ⬜ |

---

## Troubleshooting Common Issues

### Issue: No AI Citations After 1 Month
**Possible Causes:**
- Site not indexed yet by AI models
- Content quality needs improvement
- Technical issues preventing crawling

**Solutions:**
1. Verify robots.txt allows AI bots ✅
2. Check Cloudflare Analytics for bot visits
3. Submit sitemaps to Google/Bing (if not done)
4. Improve AI scores (recalculate and optimize)
5. Add more internal links between articles

### Issue: Low AI Scores (<70)
**Possible Causes:**
- Content too short (<1200 chars)
- Missing structured elements (headings, lists)
- No geographic context
- No speakable answer

**Solutions:**
1. Expand thin content (aim for 1500+ chars)
2. Add H2/H3 subheadings
3. Include location references (Marbella, Costa del Sol)
4. Regenerate speakable answers
5. Add FAQ sections

### Issue: Schema Validation Errors
**Possible Causes:**
- Malformed JSON-LD
- Missing required fields
- Incorrect data types

**Solutions:**
1. Test in Google Rich Results Test
2. Check browser console for schema errors
3. Verify SchemaMarkup component is rendering
4. Ensure all required fields are populated in database

### Issue: API Endpoints Return 404
**Possible Causes:**
- Routing not configured in Cloudflare
- Build didn't include API routes
- Environment variables missing

**Solutions:**
1. Check Cloudflare Pages build logs
2. Verify `dist` folder includes API routes after build
3. Test locally first: `npm run build && npm run preview`
4. Check Functions logs in Cloudflare for errors

### Issue: CORS Errors on API Endpoints
**Possible Causes:**
- Headers not configured in Cloudflare
- `_headers` file not deployed
- Transform Rules not applied

**Solutions:**
1. Verify `public/_headers` file exists and is committed
2. Check Transform Rules in Cloudflare Dashboard
3. Test with `curl -v -H "Origin: https://test.com"`
4. Purge Cloudflare cache and retest

---

## Completion Checklist

Before considering AI discovery "complete":

**Database (Phase 1):**
- [ ] 100% of articles have speakable answers
- [ ] Average AI score ≥80
- [ ] 90%+ articles are citation-ready

**Schema (Phase 2):**
- [ ] 10 sample articles pass Rich Results Test
- [ ] QAPage, FAQPage, Article schemas valid
- [ ] No critical schema errors

**API Endpoints (Phase 3):**
- [ ] AI feed returns 688+ articles
- [ ] AI sitemap is accessible and valid
- [ ] Individual JSON endpoints work
- [ ] CORS headers configured

**Configuration (Phase 4-5):**
- [ ] Robots.txt allows all AI bots
- [ ] All sitemaps listed and accessible
- [ ] Cloudflare cache rules configured
- [ ] Transform rules applied

**Testing (Phase 6-7):**
- [ ] 20 articles manually reviewed for quality
- [ ] Tested with ChatGPT, Claude, Perplexity
- [ ] Tracking sheet created for citations

**Monitoring (Phase 8):**
- [ ] Cloudflare Analytics enabled
- [ ] Bot traffic being monitored
- [ ] API endpoint traffic tracked

**Submission (Phase 9):**
- [ ] Submitted to Google Search Console
- [ ] Submitted to Bing Webmaster Tools
- [ ] Top pages requested for indexing

**Ongoing (Phase 10):**
- [ ] Monthly audit calendar reminder set
- [ ] Quarterly citation review scheduled
- [ ] A/B testing plan documented

---

## Estimated Timeline

| Phase | Duration | Can Start After |
|-------|----------|-----------------|
| Database Content | 2-4 hours | Immediately |
| Schema Validation | 1 hour | Database complete |
| API Testing | 30 minutes | Deployment to Cloudflare |
| Cloudflare Config | 1 hour | API testing complete |
| Content Review | 2 hours | Any time |
| AI Model Testing | Ongoing (weekly) | 2 weeks post-deployment |
| Analytics Setup | 30 minutes | Deployment complete |
| Search Submission | 1 hour | Schema validation complete |
| First Citations | 2-4 weeks | After submission |
| Consistent Citations | 2-3 months | After first citations |

**Total Setup Time**: 8-10 hours  
**Time to First Citation**: 2-4 weeks  
**Time to Consistent Citations**: 2-3 months

---

## Final Notes

- **Be Patient**: AI indexing takes weeks/months, not days
- **Quality Over Quantity**: 688 excellent articles beats 1000 poor ones
- **Monitor Regularly**: Check weekly for first 2 months, then monthly
- **Iterate Based on Data**: Double down on what gets cited
- **Stay Updated**: AI models update frequently; adjust strategy accordingly

**Questions or Issues?**
- Check troubleshooting section above
- Review Cloudflare Functions logs for API errors
- Test locally before blaming production issues
- Use browser DevTools Network tab to debug headers

---

**Last Updated**: 2025-10-11  
**Next Review**: After first deployment to Cloudflare
