# Static HTML Generation for AI Crawlability

## Overview

This system generates fully-rendered static HTML files for all QA articles and blog posts, making them 100% visible to AI crawlers without JavaScript execution.

## How It Works

### 1. Generation Script
**File:** `scripts/generate-static-html.ts`

Fetches all published articles from Supabase and generates:
- Complete HTML with full SEO metadata
- JSON-LD structured data embedded
- All hreflang links for multilingual support
- Speakable content markers for voice search
- Full article content visible without JavaScript

**Output Directory:** `/public/static/`
- `/public/static/qa/*.html` - QA article static versions
- `/public/static/blog/*.html` - Blog post static versions

### 2. Automated Regeneration
**GitHub Action:** `.github/workflows/generate-static-html.yml`

**Triggers:**
- On every push to main branch
- Daily at 2 AM UTC (scheduled)
- Manual workflow dispatch

This ensures static HTML is always up-to-date with latest content changes.

### 3. Server Configuration

#### Headers (`public/_headers`)
Static HTML files are served with:
- `Content-Type: text/html; charset=utf-8`
- Long cache times (7 days for CDN)
- `X-Robots-Tag: all` - Full crawler access
- `Vary: User-Agent` - Bot-specific serving

#### Robots.txt (`public/robots.txt`)
Explicitly allows AI crawlers to access `/static/` directory:
- GPTBot (ChatGPT)
- ClaudeBot (Claude)
- CCBot (Common Crawl)
- All major search engines

### 4. User Experience
Static HTML files include a JavaScript redirect to the interactive React version, so:
- **Bots without JS:** See full static HTML with all content
- **Users with JS:** Automatically redirected to interactive SPA

## Usage

### Manual Generation
```bash
# Add this script to package.json scripts section:
"build:static": "tsx scripts/generate-static-html.ts"

# Then run:
npm run build:static
```

### Environment Variables Required
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Files Structure

```
public/
├── static/
│   ├── qa/
│   │   ├── article-slug.html (English)
│   │   ├── es-article-slug.html (Spanish)
│   │   ├── de-article-slug.html (German)
│   │   └── ...
│   └── blog/
│       ├── post-slug.html (English)
│       ├── es-post-slug.html (Spanish)
│       └── ...
```

## AI Crawler Benefits

✅ **No JavaScript Required:** Full content visible immediately  
✅ **Complete Metadata:** All SEO tags in initial HTML  
✅ **JSON-LD Schemas:** Structured data for AI understanding  
✅ **Multilingual Support:** Proper hreflang tags  
✅ **Fast Crawling:** Pre-rendered, no SSR delay  
✅ **Speakable Markers:** Voice search optimization  

## Monitoring

### Check if bots are accessing static HTML:
```bash
# In Cloudflare Analytics, filter by:
# - URL path contains "/static/"
# - User-Agent contains "GPTBot" or "ClaudeBot"
```

### Validate HTML content:
```bash
# Test with curl (simulating bot):
curl -H "User-Agent: GPTBot" https://delsolprimehomes.com/static/qa/article-slug.html

# Should return full HTML with visible content
```

## Troubleshooting

### Static files not updating?
1. Check GitHub Actions workflow runs
2. Verify Supabase credentials in environment
3. Ensure `public/static/` directory exists
4. Check file write permissions

### Bots not seeing content?
1. Verify headers in `public/_headers`
2. Check robots.txt allows `/static/`
3. Test with curl as bot user-agent
4. Check Cloudflare caching rules

## Phase 2 Implementation Status

✅ Static HTML generation script created  
✅ GitHub Actions workflow configured  
✅ Headers optimized for bot serving  
✅ Robots.txt updated with static paths  
✅ Automated daily regeneration setup  

## Next Steps (Phase 3)

- [ ] Monitor bot crawl logs
- [ ] Verify AI platforms citing content
- [ ] Track performance improvements
- [ ] Add bot-specific HTML optimizations
- [ ] Implement differential updates (only changed articles)

---

**Note:** Remember to add `"build:static": "tsx scripts/generate-static-html.ts"` to your `package.json` scripts section!
