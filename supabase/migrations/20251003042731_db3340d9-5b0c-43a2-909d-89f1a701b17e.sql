-- Update reviewer date to Oct 2, 2025
UPDATE qa_articles 
SET 
  reviewer = jsonb_set(
    reviewer::jsonb,
    '{reviewDate}',
    '"2025-10-02"'
  ),
  updated_at = now()
WHERE slug = 'ai-mortgage-calculators-expats';

-- Delete old problematic external links (PDF and tourism)
DELETE FROM external_links 
WHERE article_id = 'c307c76c-ff4d-4ffb-aa3a-1a1993fe6b42'
  AND article_type = 'qa'
  AND (url LIKE '%bde.es%pdf%' OR url LIKE '%andalucia.org%');

-- Insert new authoritative external links
INSERT INTO external_links (
  article_id, 
  article_type,
  url, 
  anchor_text, 
  authority_score,
  relevance_score,
  verified,
  context_snippet,
  insertion_method,
  created_at,
  updated_at
)
VALUES 
  (
    'c307c76c-ff4d-4ffb-aa3a-1a1993fe6b42',
    'qa',
    'https://www.bde.es/wbe/en/',
    'Bank of Spain official data',
    95,
    98,
    true,
    'According to Bank of Spain official data (accessed October 2025), mortgages for non-residents in Spain',
    'manual_curation',
    now(),
    now()
  ),
  (
    'c307c76c-ff4d-4ffb-aa3a-1a1993fe6b42',
    'qa',
    'https://www.expatica.com/es/finance/mortgages/spanish-mortgages-101055/',
    'expatriate mortgage guides',
    90,
    95,
    true,
    'When dealing with mortgage finance as detailed in expatriate mortgage guides (accessed October 2025)',
    'manual_curation',
    now(),
    now()
  );