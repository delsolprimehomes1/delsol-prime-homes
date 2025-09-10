-- Update the AI cluster articles with proper funnel progression links
-- TOFU articles should link to MOFU, MOFU to BOFU, BOFU to booking CTA

-- Update TOFU articles to link to first MOFU article
UPDATE qa_articles 
SET 
  next_step_url = '/qa/ai-powered-property-recommendations',
  next_step_text = 'Learn how AI recommendations work'
WHERE funnel_stage = 'TOFU';

-- Update MOFU articles to link to BOFU article  
UPDATE qa_articles 
SET 
  next_step_url = '/qa/ai-investment-analysis-tools',
  next_step_text = 'See AI investment analysis tools'
WHERE funnel_stage = 'MOFU';

-- Update BOFU article to have booking CTA
UPDATE qa_articles 
SET 
  next_step_url = '/contact',
  next_step_text = 'Book a Viewing'
WHERE funnel_stage = 'BOFU';