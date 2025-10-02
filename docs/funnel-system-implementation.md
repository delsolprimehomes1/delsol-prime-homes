# Funnel Progression System Implementation

## Overview

This document describes the complete implementation of the topic-aware funnel progression system for DelSol Prime Homes, enabling seamless content flow from awareness (TOFU) to conversion (BOFU).

## Architecture

### 1. Database Schema (JSONB-Based)

Both `qa_articles` and `blog_posts` tables now support the following JSONB fields:

```sql
-- SEO metadata
seo JSONB {
  metaTitle: string,
  metaDescription: string,
  canonical: string,
  hreflang: array
}

-- Author information
author JSONB {
  name: string,
  credentials: string,
  bio: string,
  profileUrl: string
}

-- Reviewer information
reviewer JSONB {
  name: string,
  credentials: string,
  reviewDate: date
}

-- Hero image
hero_image JSONB {
  src: string,
  alt: string,
  caption: string,
  geoCoordinates: {lat, lng}
}

-- Internal links
internal_links JSONB[] [{
  slug: string,
  anchorText: string,
  context: string
}]

-- AI-generated external links (Phase 6)
external_links_ai JSONB[] [{
  url: string,
  anchorText: string,
  relevance: number
}]

-- Next funnel step
next_step JSONB {
  title: string,
  slug: string,
  url: string,
  cta: string,
  preview: string,
  funnelStage: 'TOFU'|'MOFU'|'BOFU'
}

-- Publication and quality
published BOOLEAN
ai_score DECIMAL(3,1)
```

### 2. Content Model (GitHub-First)

Content is stored in markdown files with YAML frontmatter:

```
/content/
  ├── qa/
  │   ├── en/
  │   │   ├── what-is-costa-del-sol/
  │   │   │   └── index.md
  │   │   └── best-areas-costa-del-sol/
  │   │       └── index.md
  │   ├── es/
  │   └── de/
  └── blog/
      ├── en/
      └── es/
```

### 3. Bidirectional Sync

**GitHub → Supabase** (via GitHub Actions):
- Triggered on push to `content/**/*.md`
- Parses frontmatter and content
- Validates against schema
- Upserts to Supabase with JSONB fields

**Supabase → GitHub** (manual/script):
- Export content via `scripts/export-content-to-github.js`
- Generates YAML frontmatter from JSONB fields
- Creates markdown files in proper directory structure

## Components

### NextStepPreview Component

Location: `src/components/NextStepPreview.tsx`

Displays the next step in the funnel with:
- Funnel stage badge (TOFU/MOFU/BOFU)
- Article title and preview
- CTA button
- Topic indicator
- Analytics tracking

**Priority Logic**:
1. Frontmatter `nextStep` field (explicit)
2. Database `next_step` JSONB field
3. Topic-matched query (same topic, next stage)
4. Generic fallback

### useFunnelNavigation Hook

Location: `src/hooks/useFunnelNavigation.ts`

Manages funnel navigation logic:
```typescript
const { nextStep, isLoading } = useFunnelNavigation({
  slug: 'current-article-slug',
  topic: 'Property Investment',
  funnelStage: 'TOFU',
  language: 'en',
});
```

**Features**:
- Checks JSONB `next_step` field first
- Falls back to topic-aware linking system
- Returns appropriate next step or generic fallback
- Handles loading states

## Scripts

### Content Sync (GitHub → Supabase)

**Location**: `scripts/sync-content-to-supabase.js`

**Usage**:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/sync-content-to-supabase.js ./content
```

**Features**:
- Recursively finds all markdown files
- Parses YAML frontmatter
- Transforms to database JSONB format
- Upserts to Supabase
- Reports success/failure stats

### Content Export (Supabase → GitHub)

**Location**: `scripts/export-content-to-github.js`

**Usage**:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/export-content-to-github.js ./content
```

**Features**:
- Fetches all published articles
- Generates YAML frontmatter from JSONB
- Creates directory structure
- Writes to `index.md` files
- Reports export stats

## GitHub Actions Workflow

**Location**: `.github/workflows/sync-content.yml`

**Triggers**:
- Push to `main` branch (content directory changes)
- Pull requests (content directory changes)
- Manual workflow dispatch

**Steps**:
1. Checkout repository
2. Setup Node.js
3. Install dependencies
4. Detect changed files
5. Sync to Supabase
6. Update funnel links (extensible)
7. Report status

**Required Secrets**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Funnel Flow Examples

### Example 1: Property Investment Topic

**TOFU** → **MOFU** → **BOFU**

```yaml
# TOFU: What is Costa del Sol?
slug: what-is-costa-del-sol
funnelStage: TOFU
topic: Property Investment
nextStep:
  title: "Best Areas for Investment in Costa del Sol"
  slug: best-areas-investment-costa-del-sol
  funnelStage: MOFU
  cta: "Explore Investment Areas"

---

# MOFU: Best Areas for Investment
slug: best-areas-investment-costa-del-sol
funnelStage: MOFU
topic: Property Investment
nextStep:
  title: "Book Costa del Sol Property Viewing"
  url: /book-viewing
  funnelStage: BOFU
  cta: "Schedule Your Viewing"

---

# BOFU: Book Viewing (Conversion Page)
slug: book-viewing
funnelStage: BOFU
# No next step - this is the conversion point
```

### Example 2: Family Living Topic

```yaml
# TOFU: Family-Friendly Areas
slug: family-friendly-areas-costa-del-sol
funnelStage: TOFU
topic: Family Living
nextStep:
  title: "Best Schools in Costa del Sol"
  slug: best-schools-costa-del-sol
  funnelStage: MOFU
  cta: "Learn About Schools"

---

# MOFU: Best Schools
slug: best-schools-costa-del-sol
funnelStage: MOFU
topic: Family Living
nextStep:
  title: "Find Your Perfect Family Home"
  url: /book-viewing?focus=family
  funnelStage: BOFU
  cta: "Start Your Search"
```

## Analytics Tracking

All funnel progressions are tracked via `trackFunnelProgression()`:

```typescript
trackFunnelProgression(
  currentStage: 'TOFU',
  nextStage: 'MOFU',
  articleSlug: 'current-article-slug'
);
```

This enables:
- Funnel drop-off analysis
- Topic performance tracking
- A/B testing opportunities
- User journey visualization

## Usage in Pages

### QA Article Page

```tsx
import { NextStepPreview } from '@/components/NextStepPreview';
import { useFunnelNavigation } from '@/hooks/useFunnelNavigation';

function QAPostPage({ article }) {
  const { nextStep, isLoading } = useFunnelNavigation({
    slug: article.slug,
    topic: article.topic,
    funnelStage: article.funnel_stage,
    language: article.language,
  });

  return (
    <div>
      {/* Article content */}
      <ArticleContent {...article} />
      
      {/* Next step CTA */}
      {!isLoading && (
        <NextStepPreview
          nextStep={nextStep}
          currentTopic={article.topic}
          currentStage={article.funnel_stage}
          currentSlug={article.slug}
        />
      )}
    </div>
  );
}
```

## Future Enhancements

### Phase 4: Automated Link Discovery
- AI-powered topic matching
- Automatic `next_step` suggestions
- Content gap analysis

### Phase 5: A/B Testing
- Multiple next step options
- Performance tracking per variant
- Automatic winner selection

### Phase 6: External Link Generation
- AI-generated authoritative external links
- Relevance scoring
- Automatic updates

## Maintenance

### Adding New Content

1. Create markdown file in `content/{type}/{lang}/{slug}/index.md`
2. Add complete YAML frontmatter
3. Commit and push to GitHub
4. GitHub Actions syncs to Supabase automatically

### Updating Existing Content

1. Edit markdown file in GitHub
2. Update frontmatter as needed
3. Commit and push
4. Automatic sync updates Supabase

### Manual Sync

```bash
# Sync all content to Supabase
npm run sync:content

# Export all content to GitHub
npm run export:content
```

## Troubleshooting

### Sync Failures

Check GitHub Actions logs for:
- YAML parsing errors
- Missing required fields
- Supabase connection issues
- Validation failures

### Missing Next Steps

If `nextStep` is null:
1. Check frontmatter `nextStep` field
2. Verify database `next_step` JSONB
3. Ensure topic-matched articles exist
4. Check funnel stage progression logic

### TypeScript Errors

Ensure interfaces in `src/utils/markdown-frontmatter-parser.ts` match your frontmatter structure.

## Resources

- **Frontmatter Parser**: `src/utils/markdown-frontmatter-parser.ts`
- **Content Validator**: `src/utils/content-validator.ts`
- **GitHub Sync**: `src/utils/github-content-sync.ts`
- **Topic Linking**: `src/utils/topic-aware-linking.ts`
- **Sample Templates**: `content/samples/`
- **Migration SQL**: Latest migration in `supabase/migrations/`
