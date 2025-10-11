# Cloudflare Pages Deployment Configuration

## Overview
This guide will help you deploy DelSolPrimeHomes from GitHub to Cloudflare Pages with optimal configuration for AI discovery and performance.

---

## Prerequisites
- ✅ GitHub repository connected to Lovable
- ✅ Cloudflare account (free or paid)
- ✅ Domain name (optional, but recommended)

---

## Step 1: Connect GitHub to Cloudflare Pages

### 1.1 Create New Cloudflare Pages Project
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create application** → **Connect to Git**
4. Select **GitHub** as your Git provider
5. Authorize Cloudflare to access your GitHub account

### 1.2 Select Your Repository
1. Find and select your `delsolprimehomes` repository
2. Click **Begin setup**

---

## Step 2: Configure Build Settings

### 2.1 Framework Preset
- **Framework preset**: `Vite`
- This will auto-configure most settings

### 2.2 Build Configuration
```
Production branch: main (or your default branch)
Build command: npm run build
Build output directory: dist
Root directory: / (leave empty)
```

### 2.3 Environment Variables (CRITICAL)
Click **Add variable** for each of these:

| Variable Name | Value | Where to Find |
|--------------|-------|---------------|
| `VITE_SUPABASE_URL` | `https://qvrvcvmoudxchipvzksh.supabase.co` | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Dashboard → Project Settings → API → anon/public key |
| `NODE_VERSION` | `18` | (Ensures compatibility) |

**Important**: Never commit these values to Git. They're configured in Cloudflare's dashboard.

### 2.4 Save and Deploy
1. Click **Save and Deploy**
2. Cloudflare will start building your site (takes 2-5 minutes)
3. Once complete, you'll receive a URL like `delsolprimehomes.pages.dev`

---

## Step 3: Configure Custom Domain (Optional but Recommended)

### 3.1 Add Custom Domain
1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain: `delsolprimehomes.com`
4. Cloudflare will provide DNS records to add

### 3.2 Update DNS
If your domain is already on Cloudflare:
- DNS records are added automatically ✅

If your domain is elsewhere:
- Add the CNAME record Cloudflare provides to your DNS provider
- Example: `CNAME delsolprimehomes.com -> delsolprimehomes.pages.dev`

### 3.3 Enable HTTPS
- Cloudflare automatically provisions SSL certificates
- Force HTTPS redirect is enabled by default ✅

---

## Step 4: Configure Cache Rules (AI Optimization)

### 4.1 Navigate to Cache Rules
1. In Cloudflare Dashboard, select your domain
2. Go to **Caching** → **Cache Rules**
3. Click **Create rule**

### 4.2 Rule 1: AI Feed Endpoint
```
Rule name: Cache AI Feed
When incoming requests match: Custom filter expression
Field: URI Path
Operator: equals
Value: /api/ai-feed.json

Then:
- Eligible for cache: Yes
- Edge TTL: 1 hour
- Browser TTL: 1 hour
```

### 4.3 Rule 2: AI Sitemap
```
Rule name: Cache AI Sitemap
When incoming requests match: Custom filter expression
Field: URI Path
Operator: equals
Value: /api/sitemap-ai.xml

Then:
- Eligible for cache: Yes
- Edge TTL: 1 hour
- Browser TTL: 1 hour
```

### 4.4 Rule 3: Individual QA JSON
```
Rule name: Cache QA JSON
When incoming requests match: Custom filter expression
Field: URI Path
Operator: contains
Value: /api/qa/

Then:
- Eligible for cache: Yes
- Edge TTL: 24 hours
- Browser TTL: 24 hours
```

### 4.5 Rule 4: Static Assets (Optional but Recommended)
```
Rule name: Cache Static Assets
When incoming requests match: Custom filter expression
Field: URI Path
Operator: contains
Value: /assets/

Then:
- Eligible for cache: Yes
- Edge TTL: 1 year
- Browser TTL: 1 year
```

---

## Step 5: Configure Transform Rules (Custom Headers)

### 5.1 Navigate to Transform Rules
1. In Cloudflare Dashboard, select your domain
2. Go to **Rules** → **Transform Rules** → **Modify Response Header**
3. Click **Create rule**

### 5.2 Rule 1: Security Headers (All Pages)
```
Rule name: Security Headers
When incoming requests match: All incoming requests

Then:
Add headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
```

### 5.3 Rule 2: AI Endpoints CORS
```
Rule name: AI Endpoints CORS
When incoming requests match: Custom filter expression
Field: URI Path
Operator: matches regex
Value: ^/api/(ai-feed\.json|sitemap-ai\.xml|qa/.*)$

Then:
Add headers:
- Access-Control-Allow-Origin: *
- Access-Control-Allow-Methods: GET, OPTIONS
- Access-Control-Allow-Headers: Content-Type
```

**Note**: The `public/_headers` file in this repo also configures headers. Cloudflare Pages reads this file automatically, but Transform Rules take precedence.

---

## Step 6: Enable Analytics & Bot Management

### 6.1 Enable Web Analytics
1. Go to **Analytics & Logs** → **Web Analytics**
2. Enable analytics for your site
3. This tracks AI crawler visits (GPTBot, ClaudeBot, etc.)

### 6.2 Bot Management (Paid Plan)
If you have a paid Cloudflare plan:
1. Go to **Security** → **Bots**
2. Enable **Bot Fight Mode** or **Super Bot Fight Mode**
3. Configure to **Allow** these AI crawlers:
   - GPTBot (OpenAI)
   - ChatGPT-User (OpenAI)
   - ClaudeBot (Anthropic)
   - Claude-Web (Anthropic)
   - anthropic-ai
   - CCBot (Common Crawl)
   - Applebot (Apple)
   - Googlebot (Google)

**Important**: Don't block AI crawlers! They need access to cite your content.

---

## Step 7: Verify Deployment

### 7.1 Test Your Site
Visit your deployed URL: `https://delsolprimehomes.com` (or `.pages.dev`)

Check these pages load correctly:
- ✅ Homepage: `/`
- ✅ QA Hub: `/qa`
- ✅ Sample QA: `/qa/buying-process-costa-del-sol`
- ✅ Blog: `/blog`

### 7.2 Test AI Endpoints
Open these URLs in your browser:

1. **AI Feed**: `https://delsolprimehomes.com/api/ai-feed.json`
   - Should return JSON with 688+ articles
   
2. **AI Sitemap**: `https://delsolprimehomes.com/api/sitemap-ai.xml`
   - Should return XML sitemap
   
3. **Individual QA JSON**: `https://delsolprimehomes.com/api/qa/buying-process-costa-del-sol.json`
   - Should return structured article JSON

### 7.3 Verify Headers
Use browser DevTools (F12 → Network tab) to check:
- ✅ `X-Robots-Tag: all` is present
- ✅ `Access-Control-Allow-Origin: *` on API endpoints
- ✅ `Cache-Control` headers are set correctly

---

## Step 8: Monitor AI Crawler Activity

### 8.1 Check Analytics Weekly
1. Go to **Analytics & Logs** → **Traffic**
2. Filter by **User Agent** to see bot traffic
3. Look for:
   - `GPTBot` (OpenAI/ChatGPT)
   - `ClaudeBot` (Anthropic/Claude)
   - `CCBot` (Common Crawl - used by many AI models)
   - `Googlebot` (Google/Gemini)

### 8.2 Expected Behavior
- **First 2 weeks**: Low bot traffic (crawlers discovering site)
- **After 1 month**: Regular weekly visits from AI crawlers
- **After 3 months**: Daily visits as your content gets indexed

---

## Step 9: Set Up Automatic Deployments

### 9.1 GitHub Integration (Already Configured)
- ✅ Every push to your main branch automatically deploys to Cloudflare
- ✅ Every pull request creates a preview deployment
- ✅ No manual deployment needed!

### 9.2 Rollback (If Needed)
1. In Cloudflare Pages, go to **Deployments**
2. Find a previous successful deployment
3. Click **⋯** → **Rollback to this deployment**

---

## Step 10: Performance Optimization

### 10.1 Enable Auto Minify
1. Go to **Speed** → **Optimization** → **Content Optimization**
2. Enable:
   - ✅ Auto Minify: JavaScript, CSS, HTML
   - ✅ Brotli compression

### 10.2 Enable Early Hints
1. Go to **Speed** → **Optimization** → **Protocol Optimization**
2. Enable **Early Hints** (sends link headers before full page)
3. This speeds up AI crawler access

### 10.3 Enable HTTP/3 (QUIC)
1. Go to **Network** → **HTTP/3 (with QUIC)**
2. Toggle **On**
3. Faster protocol for modern browsers and crawlers

---

## Troubleshooting

### Issue: Build Fails with "Module not found"
**Solution**: Ensure all dependencies are in `package.json` and committed to Git.

### Issue: Environment Variables Not Working
**Solution**: 
1. Verify variable names start with `VITE_` (required for Vite)
2. Re-deploy after adding variables (they don't apply retroactively)

### Issue: API Endpoints Return 404
**Solution**: 
1. Check that your API routes are in `src/pages/api/` directory
2. Verify the build output includes these files
3. Check Cloudflare Functions logs for errors

### Issue: AI Crawlers Not Visiting
**Solution**:
1. Verify `robots.txt` allows AI bots (already configured ✅)
2. Submit sitemaps to Google Search Console and Bing Webmaster Tools
3. Wait 2-4 weeks for initial indexing

### Issue: Cache Not Working
**Solution**:
1. Check Cache Rules are enabled
2. Purge cache: **Caching** → **Configuration** → **Purge Cache**
3. Test with `curl -I https://delsolprimehomes.com/api/ai-feed.json` to see headers

---

## Next Steps After Deployment

1. ✅ **Phase 1**: Generate speakable answers (navigate to `/admin/speakable-generator`)
2. ✅ **Phase 5**: Cloudflare deployment (you're here!)
3. ⬜ **Phase 7**: Submit to AI platforms (next step)
   - Google Search Console
   - Bing Webmaster Tools
   - Perplexity (via Bing)

---

## Quick Reference: Key URLs

| Purpose | URL |
|---------|-----|
| Cloudflare Dashboard | https://dash.cloudflare.com/ |
| Pages Project | https://dash.cloudflare.com/pages |
| DNS Settings | https://dash.cloudflare.com/dns |
| Analytics | https://dash.cloudflare.com/analytics |
| Cache Rules | https://dash.cloudflare.com/caching/cache-rules |
| Transform Rules | https://dash.cloudflare.com/rules/transform-rules |

---

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Cloudflare Community**: https://community.cloudflare.com/
- **Your Site Status**: Check uptime at https://www.cloudflarestatus.com/

---

## Summary Checklist

Before launching, ensure:
- ✅ Site deploys successfully from GitHub
- ✅ Environment variables configured
- ✅ Custom domain connected (optional)
- ✅ Cache rules for AI endpoints set
- ✅ CORS headers enabled for `/api/*` endpoints
- ✅ Analytics enabled
- ✅ AI crawlers allowed in Bot Management
- ✅ All API endpoints return data (not 404)
- ✅ `robots.txt` allows AI bots
- ✅ Sitemaps accessible at `/sitemap*.xml`

**Estimated Setup Time**: 30-45 minutes

**Expected Result**: Your site will be live on Cloudflare with optimal configuration for AI discovery, fast performance, and automatic deployments from GitHub.
