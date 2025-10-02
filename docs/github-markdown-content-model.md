# GitHub Markdown Content Model

A comprehensive content management system that uses GitHub as the primary storage for markdown files with YAML frontmatter, synchronized with Supabase for dynamic content delivery.

## Directory Structure

```
/content/
├── en/
│   ├── qa/
│   │   └── buying-process-spain/
│   │       └── index.md
│   └── blog/
│       └── luxury-market-update-2025/
│           └── index.md
├── es/
│   ├── qa/
│   └── blog/
└── de/
    ├── qa/
    └── blog/
```

## Frontmatter Schema

### Required Fields

```yaml
---
title: "Complete Guide to Buying Property in Spain"
slug: "buying-process-spain"
language: "en"
funnelStage: "MOFU"  # TOFU | MOFU | BOFU
topic: "buying-process"
summary: "Brief excerpt for listings and meta description fallback"

seo:
  metaTitle: "Spain Property Buying Process 2025 | Complete Guide"
  metaDescription: "Expert guide to buying property in Spain..."
---
```

### Optional Enhanced Fields

#### Voice Search Optimization (AEO)
```yaml
speakableQuestions:
  - "How do I buy property in Spain as a foreigner?"
  - "What documents do I need?"
speakableAnswer: "Concise answer optimized for voice assistants"
```

#### E-E-A-T (Experience, Expertise, Authority, Trust)
```yaml
author:
  name: "David Martinez"
  credentials: "Licensed Real Estate Agent, 15 years Costa del Sol"
  bio: "Specialist in international property transactions"
reviewer:
  name: "Maria Gonzalez"
  credentials: "Spanish Property Lawyer, Colegiado #4521"
  reviewDate: "2025-09-15"
```

#### Geographic Signals
```yaml
geo:
  latitude: 36.5100
  longitude: -4.8826
  address: "Costa del Sol, Málaga, Spain"
  areaServed: ["Marbella", "Estepona", "Fuengirola"]
```

#### Media & Images
```yaml
heroImage:
  src: "/images/content/buying-process-hero.jpg"
  alt: "Spanish notary signing property deed"
  caption: "Final signing ceremony at notary office"
  geoCoordinates: { lat: 36.5100, lng: -4.8826 }
```

#### Internal Linking
```yaml
internalLinks:
  - slug: "nie-number-application"
    anchor: "NIE number application process"
  - slug: "spanish-property-taxes"
    anchor: "understanding Spanish property taxes"
```

#### Funnel Navigation
```yaml
nextStep:
  title: "Calculate Your Purchase Costs"
  slug: "spain-property-purchase-costs-calculator"
  cta: "Use Free Calculator"
```

#### SEO Enhancements
```yaml
seo:
  metaTitle: "Title under 60 chars"
  metaDescription: "Description under 160 chars"
  canonical: "https://delsolprimehomes.com/qa/buying-process-spain"
  hreflang:
    - lang: "es"
      url: "https://delsolprimehomes.com/es/qa/proceso-compra-espana"
    - lang: "de"
      url: "https://delsolprimehomes.com/de/qa/immobilienkauf-spanien"
```

## Content Management Workflow

### 1. Create Content in GitHub
```bash
# Create new markdown file
mkdir -p content/en/qa/your-slug/
touch content/en/qa/your-slug/index.md
```

### 2. Use the Markdown Manager Interface
- Navigate to `/markdown-manager`
- Paste your markdown content
- Select content type (QA or Blog)
- Click "Validate" to check frontmatter compliance
- Click "Sync to Supabase" to publish

### 3. Validation Scores
The system validates:
- **Required fields**: Title, slug, language, funnel stage, topic, summary
- **SEO compliance**: Meta title length (<60), description length (<160)
- **Content quality**: Word count, heading structure, alt text
- **Voice search**: Speakable questions and answers
- **E-E-A-T signals**: Author credentials, reviewer information
- **Accessibility**: Image alt text, heading hierarchy

Score breakdown:
- **80-100**: Excellent - ready for publication
- **60-79**: Good - minor improvements recommended
- **0-59**: Needs work - fix errors before syncing

## Bidirectional Sync

### GitHub → Supabase
- Content changes in GitHub markdown files automatically sync to Supabase
- Change detection via content hashing prevents unnecessary updates
- Validation ensures only compliant content is synced

### Supabase → GitHub
- Export content from Supabase back to markdown format
- Preserves all frontmatter fields
- Generates properly formatted YAML

## Database Schema

### New Tables
- `content_authors`: Author credentials for E-E-A-T
- `content_reviewers`: Content review tracking

### Extended Tables
Both `qa_articles` and `blog_posts` now include:
- `frontmatter_yaml`: Full YAML frontmatter storage
- `markdown_hash`: Content change detection
- `github_path`: File path in repository
- `speakable_questions`: Voice search optimization
- `speakable_answer`: Concise voice-friendly answer
- `geo_coordinates`: Geographic signals (JSONB)
- `area_served`: Service areas array
- `author_id`: Reference to content_authors
- `reviewer_id`: Reference to content_reviewers

## Benefits

### For Content Creators
- ✅ Write in familiar markdown format
- ✅ Version control via Git
- ✅ Offline editing support
- ✅ Validation before publishing
- ✅ SEO guidance built-in

### For Developers
- ✅ Single source of truth (GitHub)
- ✅ Automated deployment pipeline
- ✅ Type-safe frontmatter schema
- ✅ Change detection prevents duplicates
- ✅ Extensible validation system

### For SEO
- ✅ Structured E-E-A-T signals
- ✅ Voice search optimization
- ✅ Geographic targeting
- ✅ Internal linking automation
- ✅ Schema.org integration ready

## Next Steps

1. **Create sample content** using the templates in `/content/samples/`
2. **Test the sync** via `/markdown-manager`
3. **Monitor validation scores** to improve content quality
4. **Set up GitHub Actions** for automated sync on push
5. **Integrate with AI optimization** for enhanced content generation

## Support

For questions or issues:
- Check `/docs/multilingual-system-guide.md` for i18n integration
- Review `/docs/blog-structure-guide.md` for blog-specific guidance
- See validation errors in the Markdown Manager interface
