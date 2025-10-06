-- Phase 1: Add Hans Beeckman as Content Reviewer
INSERT INTO content_reviewers (
  id,
  name,
  credentials,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Hans Beeckman',
  'Accredited Property Specialist, Costa del Sol Real Estate Expert',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Phase 4: Bulk Update All QA Articles with Hans Beeckman as Reviewer
UPDATE qa_articles
SET 
  reviewer_id = '550e8400-e29b-41d4-a716-446655440000'::uuid,
  reviewer = jsonb_build_object(
    'name', 'Hans Beeckman',
    'credentials', jsonb_build_array('Accredited Property Specialist', 'Costa del Sol Real Estate Expert'),
    'reviewDate', NOW()
  ),
  updated_at = NOW()
WHERE reviewer_id IS NULL OR reviewer IS NULL;

COMMENT ON TABLE content_reviewers IS 'Stores verified content reviewers with their credentials for E-E-A-T signals';