-- First, create the reviewer if not exists
INSERT INTO content_reviewers (id, name, credentials, created_at, updated_at)
VALUES (
  '8a7c9b3d-5e2f-4a1b-9c8d-7e6f5a4b3c2d',
  'Carlos Mendez',
  'Certified Financial Planner (CFP), Spanish Mortgage Regulation Specialist',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Update the article with reviewer information
UPDATE qa_articles
SET 
  reviewer_id = '8a7c9b3d-5e2f-4a1b-9c8d-7e6f5a4b3c2d',
  reviewer = jsonb_build_object(
    'name', 'Carlos Mendez',
    'title', 'Independent Financial Compliance Auditor',
    'credentials', jsonb_build_array(
      'Certified Financial Planner (CFP)',
      'Spanish Mortgage Regulation Specialist'
    ),
    'reviewDate', '2025-10-01',
    'profileUrl', 'https://delsolprimehomes.com/team/carlos-mendez'
  ),
  updated_at = now()
WHERE slug = 'ai-mortgage-calculators-expats';