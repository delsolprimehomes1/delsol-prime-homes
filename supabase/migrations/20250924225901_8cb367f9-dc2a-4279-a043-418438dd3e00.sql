-- Link the TOFU health benefits article to a relevant MOFU lifestyle article
UPDATE qa_articles 
SET points_to_mofu_id = (
  SELECT id FROM qa_articles 
  WHERE slug = 'golf-vs-padel-vs-wellness-which-lifestyle-fits-uk-irish-buyers-best-on-the-costa-del-sol' 
  AND funnel_stage = 'MOFU'
  LIMIT 1
)
WHERE slug = 'what-are-the-health-benefits-of-living-in-a-sunny-climate-like-the-costa-del-sol'
AND funnel_stage = 'TOFU';

-- Link the MOFU lifestyle article to a relevant BOFU checklist
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE slug = 'education-healthcare-checklist-what-should-uk-and-irish-buyers-verify-before-purchasing-on-the-costa-del-sol' 
  AND funnel_stage = 'BOFU'
  LIMIT 1
)
WHERE slug = 'golf-vs-padel-vs-wellness-which-lifestyle-fits-uk-irish-buyers-best-on-the-costa-del-sol'
AND funnel_stage = 'MOFU';

-- Ensure the BOFU article has booking enabled
UPDATE qa_articles 
SET appointment_booking_enabled = true
WHERE slug = 'education-healthcare-checklist-what-should-uk-and-irish-buyers-verify-before-purchasing-on-the-costa-del-sol'
AND funnel_stage = 'BOFU';