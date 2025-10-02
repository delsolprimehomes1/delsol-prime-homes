-- Phase 1: Add missing JSONB fields to qa_articles and blog_posts

-- Add JSONB fields to qa_articles
ALTER TABLE qa_articles
  ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS author JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reviewer JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hero_image JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS internal_links JSONB[] DEFAULT ARRAY[]::jsonb[],
  ADD COLUMN IF NOT EXISTS external_links_ai JSONB[] DEFAULT ARRAY[]::jsonb[],
  ADD COLUMN IF NOT EXISTS next_step JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_score DECIMAL(3,1) DEFAULT NULL;

-- Add JSONB fields to blog_posts
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS author JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reviewer JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hero_image JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS internal_links JSONB[] DEFAULT ARRAY[]::jsonb[],
  ADD COLUMN IF NOT EXISTS external_links_ai JSONB[] DEFAULT ARRAY[]::jsonb[],
  ADD COLUMN IF NOT EXISTS next_step JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_score DECIMAL(3,1) DEFAULT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_qa_published ON qa_articles(published);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_qa_ai_score ON qa_articles(ai_score) WHERE ai_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_ai_score ON blog_posts(ai_score) WHERE ai_score IS NOT NULL;

-- Migrate existing author_id to author JSONB (for qa_articles)
UPDATE qa_articles qa
SET author = jsonb_build_object(
  'name', COALESCE(ca.name, 'DelSol Prime Homes'),
  'credentials', ca.credentials,
  'bio', ca.bio,
  'profileUrl', ca.profile_url
)
FROM content_authors ca
WHERE qa.author_id = ca.id AND qa.author IS NULL;

-- Migrate existing reviewer_id to reviewer JSONB (for qa_articles)
UPDATE qa_articles qa
SET reviewer = jsonb_build_object(
  'name', cr.name,
  'credentials', cr.credentials,
  'reviewDate', cr.review_date
)
FROM content_reviewers cr
WHERE qa.reviewer_id = cr.id AND qa.reviewer IS NULL;

-- Migrate existing author_id to author JSONB (for blog_posts)
UPDATE blog_posts bp
SET author = jsonb_build_object(
  'name', COALESCE(ca.name, bp.author, 'DelSol Prime Homes'),
  'credentials', ca.credentials,
  'bio', ca.bio,
  'profileUrl', ca.profile_url
)
FROM content_authors ca
WHERE bp.author_id = ca.id AND bp.author IS NULL;

-- Migrate existing reviewer_id to reviewer JSONB (for blog_posts)
UPDATE blog_posts bp
SET reviewer = jsonb_build_object(
  'name', cr.name,
  'credentials', cr.credentials,
  'reviewDate', cr.review_date
)
FROM content_reviewers cr
WHERE bp.reviewer_id = cr.id AND bp.reviewer IS NULL;

-- Migrate hero_image data for qa_articles
UPDATE qa_articles
SET hero_image = jsonb_build_object(
  'src', image_url,
  'alt', alt_text,
  'geoCoordinates', geo_coordinates
)
WHERE image_url IS NOT NULL AND hero_image IS NULL;

-- Migrate hero_image data for blog_posts
UPDATE blog_posts
SET hero_image = jsonb_build_object(
  'src', featured_image,
  'alt', image_alt,
  'geoCoordinates', geo_coordinates
)
WHERE featured_image IS NOT NULL AND hero_image IS NULL;

-- Migrate SEO data for qa_articles
UPDATE qa_articles
SET seo = jsonb_build_object(
  'metaTitle', h1_title,
  'metaDescription', excerpt,
  'canonical', NULL,
  'hreflang', ARRAY[]::text[]
)
WHERE seo = '{}'::jsonb;

-- Migrate SEO data for blog_posts
UPDATE blog_posts
SET seo = jsonb_build_object(
  'metaTitle', COALESCE(meta_title, title),
  'metaDescription', COALESCE(meta_description, excerpt),
  'canonical', canonical_url,
  'hreflang', ARRAY[]::text[]
)
WHERE seo = '{}'::jsonb;

-- Migrate next_step data from existing fields (qa_articles)
UPDATE qa_articles
SET next_step = jsonb_build_object(
  'title', next_step_text,
  'url', next_step_url,
  'slug', NULL
)
WHERE next_step_url IS NOT NULL AND next_step IS NULL;

COMMENT ON COLUMN qa_articles.seo IS 'SEO metadata: {metaTitle, metaDescription, canonical, hreflang[]}';
COMMENT ON COLUMN qa_articles.author IS 'Author information: {name, credentials, bio, profileUrl}';
COMMENT ON COLUMN qa_articles.reviewer IS 'Reviewer information: {name, credentials, reviewDate}';
COMMENT ON COLUMN qa_articles.hero_image IS 'Hero image data: {src, alt, caption, geoCoordinates}';
COMMENT ON COLUMN qa_articles.internal_links IS 'Internal links: [{slug, anchorText, context}]';
COMMENT ON COLUMN qa_articles.external_links_ai IS 'AI-generated external links: [{url, anchorText, relevance}]';
COMMENT ON COLUMN qa_articles.next_step IS 'Next funnel step: {title, slug, url, cta}';
COMMENT ON COLUMN qa_articles.published IS 'Publication status';
COMMENT ON COLUMN qa_articles.ai_score IS 'AI optimization score (0.0-10.0)';

COMMENT ON COLUMN blog_posts.seo IS 'SEO metadata: {metaTitle, metaDescription, canonical, hreflang[]}';
COMMENT ON COLUMN blog_posts.author IS 'Author information: {name, credentials, bio, profileUrl}';
COMMENT ON COLUMN blog_posts.reviewer IS 'Reviewer information: {name, credentials, reviewDate}';
COMMENT ON COLUMN blog_posts.hero_image IS 'Hero image data: {src, alt, caption, geoCoordinates}';
COMMENT ON COLUMN blog_posts.internal_links IS 'Internal links: [{slug, anchorText, context}]';
COMMENT ON COLUMN blog_posts.external_links_ai IS 'AI-generated external links: [{url, anchorText, relevance}]';
COMMENT ON COLUMN blog_posts.next_step IS 'Next funnel step: {title, slug, url, cta}';
COMMENT ON COLUMN blog_posts.published IS 'Publication status';
COMMENT ON COLUMN blog_posts.ai_score IS 'AI optimization score (0.0-10.0)';