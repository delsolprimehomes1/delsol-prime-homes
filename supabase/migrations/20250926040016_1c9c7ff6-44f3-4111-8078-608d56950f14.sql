-- Temporarily disable the duplicate title check trigger
ALTER TABLE qa_articles DISABLE TRIGGER check_duplicate_title_trigger;

-- Phase 1: Enable booking for all BOFU checklist articles
UPDATE qa_articles 
SET appointment_booking_enabled = true, 
    final_cta_type = 'booking'
WHERE funnel_stage = 'BOFU' 
  AND title ILIKE '%checklist%'
  AND appointment_booking_enabled = false;

-- Phase 2: Fix misaligned topic links
-- Fix Legal & Process MOFU to link to correct BOFU (Finance checklist as closest match)
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Finance' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Legal & Process' 
  AND funnel_stage = 'MOFU'
  AND points_to_bofu_id IN (
    SELECT id FROM qa_articles WHERE topic != 'Legal & Process' AND funnel_stage = 'BOFU'
  );

-- Fix Location TOFU to link to Location MOFU
UPDATE qa_articles 
SET points_to_mofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Location' AND funnel_stage = 'MOFU' 
  LIMIT 1
)
WHERE topic = 'Location' 
  AND funnel_stage = 'TOFU'
  AND points_to_mofu_id IN (
    SELECT id FROM qa_articles WHERE topic != 'Location' AND funnel_stage = 'MOFU'
  );

-- Fix Lifestyle TOFU to link to Lifestyle MOFU
UPDATE qa_articles 
SET points_to_mofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Lifestyle' AND funnel_stage = 'MOFU' 
  LIMIT 1
)
WHERE topic = 'Lifestyle' 
  AND funnel_stage = 'TOFU'
  AND points_to_mofu_id IN (
    SELECT id FROM qa_articles WHERE topic != 'Lifestyle' AND funnel_stage = 'MOFU'
  );

-- Fix Education MOFU to link to General BOFU (closest match since no Education BOFU exists)
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'General' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Education' 
  AND funnel_stage = 'MOFU'
  AND points_to_bofu_id IN (
    SELECT id FROM qa_articles WHERE topic != 'Education' AND funnel_stage = 'BOFU'
  );

-- Phase 3: Complete missing BOFU links for topic-matched articles
-- Link Finance TOFU articles to Finance BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Finance' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Finance' 
  AND funnel_stage = 'TOFU' 
  AND points_to_bofu_id IS NULL;

-- Link General TOFU articles to General BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'General' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'General' 
  AND funnel_stage = 'TOFU' 
  AND points_to_bofu_id IS NULL;

-- Link Lifestyle TOFU articles to Lifestyle BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Lifestyle' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Lifestyle' 
  AND funnel_stage = 'TOFU' 
  AND points_to_bofu_id IS NULL;

-- Link Location TOFU articles to Location BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Location' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Location' 
  AND funnel_stage = 'TOFU' 
  AND points_to_bofu_id IS NULL;

-- Link Property Types TOFU articles to Property Types BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Property Types' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Property Types' 
  AND funnel_stage = 'TOFU' 
  AND points_to_bofu_id IS NULL;

-- Link Finance MOFU articles to Finance BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Finance' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Finance' 
  AND funnel_stage = 'MOFU' 
  AND points_to_bofu_id IS NULL;

-- Link General MOFU articles to General BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'General' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'General' 
  AND funnel_stage = 'MOFU' 
  AND points_to_bofu_id IS NULL;

-- Link Lifestyle MOFU articles to Lifestyle BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Lifestyle' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Lifestyle' 
  AND funnel_stage = 'MOFU' 
  AND points_to_bofu_id IS NULL;

-- Link Location MOFU articles to Location BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Location' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Location' 
  AND funnel_stage = 'MOFU' 
  AND points_to_bofu_id IS NULL;

-- Link Property Types MOFU articles to Property Types BOFU
UPDATE qa_articles 
SET points_to_bofu_id = (
  SELECT id FROM qa_articles 
  WHERE topic = 'Property Types' AND funnel_stage = 'BOFU' 
  LIMIT 1
)
WHERE topic = 'Property Types' 
  AND funnel_stage = 'MOFU' 
  AND points_to_bofu_id IS NULL;

-- Re-enable the duplicate title check trigger
ALTER TABLE qa_articles ENABLE TRIGGER check_duplicate_title_trigger;