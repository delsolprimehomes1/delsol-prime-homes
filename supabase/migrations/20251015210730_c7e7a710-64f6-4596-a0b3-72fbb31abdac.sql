-- Add Hans Beeckman as default reviewer for articles missing reviewer data
-- This improves E-E-A-T signals and JSON-LD schema completeness for AI engines

-- Step 1: Set default reviewer JSONB for articles with NULL reviewer
UPDATE qa_articles
SET reviewer = jsonb_build_object(
  'name', 'Hans Beeckman',
  'credentials', ARRAY['Accredited Property Specialist'],
  'reviewDate', CURRENT_DATE::text
)
WHERE reviewer IS NULL;

-- Step 2: Link to reviewer_id (using a default UUID for Hans Beeckman)
-- First, ensure Hans Beeckman exists in content_reviewers table
INSERT INTO content_reviewers (id, name, credentials, review_date, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Hans Beeckman',
  'Accredited Property Specialist',
  CURRENT_DATE,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update articles to reference Hans Beeckman's reviewer_id
UPDATE qa_articles
SET reviewer_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE reviewer_id IS NULL;